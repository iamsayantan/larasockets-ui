<template>
  <div class="container-fluid">
    <!-- if you need full page then replace class container-fluid with container and give appropriate margin and padding -->
    <!-- 1st block -->
    <div class="row m-1 p-2" style="background-color:#F7F7F7;">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" >
        <form class="form-inline m-md-3 m-lg-3 m-xl-3" @submit.prevent="requestForAuthorization">
          <div class="form-group mx-sm-1 m-md-1 m-lg-1 m-xl-1">
            <label for="inputState">App</label>
            <select v-model="connection_request.app_id" id="inputState" class="form-control ml-md-4 ml-lg-4 ml-xl-4" :disabled="connected">
              <option selected>Choose...</option>
              <option v-for="app in apps" :key="app.app_id" :value="app.app_id">{{ app.app_name }}</option>
            </select>
          </div>
          <div class="form-group mx-sm-1">
            <label for="port">Secret</label>
            <input
              v-model="connection_request.app_secret"
              class="form-control ml-md-4 ml-lg-4 ml-xl-4"
              id="port" placeholder="Your application secret" 
              :disabled="connected" />
          </div>
          <div class="form-group mx-sm-1">
            <button v-if="!connected" type="submit" class="btn btn-success customeclass" :disabled="isConnecting">Connect</button>
            <button v-else type="button" class="btn btn-danger customeclass" :disabled="isDisconnecting">Disconnect</button>
          </div>

        </form>
      </div>
    </div>

    <div v-if="connected">
      <div class="row  text-center" style="margin-top: 15px;">
        <div class="col-sm-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title font-weight-bold">Concurrent Connections</h5>
              <p class="card-text" style="font-size: 40px">{{ connection_stats.concurrent }}</p>
            </div>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title font-weight-bold">Peak Connections</h5>
              <p class="card-text" style="font-size: 40px">{{ daily_stats.peak_connections }}</p>
            </div>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title font-weight-bold">API Messages</h5>
              <p class="card-text" style="font-size: 40px">{{ daily_stats.api_messages }}</p>
            </div>
          </div>
        </div>
        <div class="col-sm-3">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title font-weight-bold">Websocket Messages</h5>
              <p class="card-text" style="font-size: 40px">{{ daily_stats.websocket_messages }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- end of first block -->
      <!-- graph block -->
      <div class="row m-1 p-2">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <div id="statisticsChart" ref="chart"></div>
        </div>
      </div>
      <!-- end of graph block -->
      <!-- event creator -->
      <div class="row m-1 p-2">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <h4>Event Creator</h4>
          <form @submit.prevent="handleSendEvent">
            <div class="form-row">
              <div class="form-group col-md-6">
                <input v-model="trigger_event_payload.channel" type="text" class="form-control" id="channel" placeholder="Channel">
              </div>
              <div class="form-group col-md-6">
                <input v-model="trigger_event_payload.event" type="text" class="form-control" id="event" placeholder="Event">
              </div>
              <div class="form-group col-md-12">
                <textarea v-model="trigger_event_payload.data" class="form-control" placeholder="Data" id="exampleFormControlTextarea1" rows="4"></textarea>
              </div>
              <div class="form-group col-md-12 d-flex justify-content-end">
                <button type="submit" class="btn btn-primary mb-2">Send Event</button>
                <button type="button" style="margin-left: 5px;" class="btn btn-danger mb-2" @click="logs = []">Clear Logs</button>
              </div>
            </div>

          </form>
        </div>
      </div>
      <!-- end of event creator -->

      <!-- event table -->
      <div class="row m-1 p-2">
        <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
          <h4>Events</h4>
          <table class="table table-striped table-responsive-xs table-responsive-sm">
            <thead>
              <tr>
                <th scope="col">Type</th>
                <th scope="col">Socket ID</th>
                <th scope="col">Details</th>
                <th scope="col">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in logs" :key="index">
                <th scope="row">
                  <span class="badge" :style="`background-color: ${ log_types[log.type].colour }; color: white`">{{ log_types[log.type].label }}</span>
                </th>
                <td>{{ log.connection_id || 'N/A' }}</td>
                <td>
                  <template v-if="log.channel_name || log.event_name">
                    <span v-if="log.channel_name">Channel: </span> <span class="badge badge-primary">{{ log.channel_name }}</span>
                    <span v-if="log.event_name"> | Event:  </span> <span class="badge badge-primary">{{ log.event_name }}</span>
                  </template>
                  <template v-else>N/A</template>
                </td>
                <td>{{ new Date(log.time * 1000).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <!-- end event table -->
    </div>
  </div>
</template>
<script>
import Pusher from 'pusher-js'
import Plotly from 'plotly.js-dist'
import moment from 'moment'

export default {
  name: "Dashboard",
  data() {
    return {
      pusher: null,
      chart: null,
      log_types: {
        connected: {
          label: 'New Connection',
          colour: '#28A745'
        },
        disconnected: {
          label: 'Disconnected',
          colour: '#DC3545'
        },
        api_message: {
          label: 'API Message',
          colour: '#17A2B8'
        },
        occupied: {
          label: 'Channel Occupied',
          colour: '#007BFF'
        },
        vacated: {
          label: 'Channel Vacated',
          colour: '#343A40'
        }
      },

      apps: [],

      current_app_id: null,

      dailyStatTimer: null,

      connection_request: {
        app_id: null,
        app_secret: ''
      },

      connected: false,
      connected_app: {},

      connection_stats: {
        concurrent: 0,
        peak: 0
      },

      daily_stats: {
        peak_connections: 0,
        api_messages: 0,
        websocket_messages: 0
      },

      logs: [],

      trigger_event_payload: {
        event: null,
        channel: null,
        data: null
      },

      isConnecting: false,
      isDisconnecting: false,
      chartOptions: {
        colors: ['#F77F10', '#2C9F29', '#2D7FB7'], // chart bar and line colors
        series: [{
          name: 'Websockets Messages',
          type: 'column',
          data: [10, 2, 2.5, 1.5, 2.5, 2.8, 3.8, 4.6]
        }, {
          name: 'API Messages',
          type: 'column',
          data: [50, 3, 3.1, 4, 4.1, 4.9, 6.5, 8.5]
        }, {
          name: 'Pick Connection',
          type: 'line',
          data: [15, 29, 37, 36, 44, 45, 50, 58]
        }],
        chart: {
          height: 300,
          type: 'line',
          stacked: false,
          toolbar: {
            show: true
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [1, 1, 3]
        },
        title: {
          text: 'Real Time statistics',
          align: 'left',
          margin: 10,
          offsetX: 10,
          offsetY: 10,
          floating: false,
          style: {
            fontSize:  '16px',
            fontWeight:  'bold',
            color:  '#263238'
          },
        },
        xaxis: {
          categories: [12, 13, 14, 15, 16, 17, 18, 19],
        },
        yaxis: [
          {
            categories: [12, 13, 14, 15, 16, 17, 18, 19],
            axisTicks: {
              show: true,
            },
            axisBorder: {
              show: true,
              color: '#008FFB'
            },
            labels: {
              style: {
                colors: '#008FFB',
              }
            },
            title: {
              text: "Numbers",
              style: {
                color: '#008FFB',
              }
            },
            tooltip: {
              enabled: true
            }
          },
        ],
        tooltip: {
          fixed: {
            enabled: false,
            position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
            offsetY: 30,
            offsetX: 60
          },
        },
        legend: {
          position: 'top',
          horizontalAlign: 'right',
          offsetX: 5,
          offsetY: 10
        }
      }
    }
  },
  
  mounted() {
    this.fetchAppList()
  },

  beforeDestroy() {
    clearInterval(this.dailyStatTimer)
  },

  methods: {
    async fetchAppList() {
      try {
      const { data } = await this.$axios.get('/dashboard/apps')
        this.apps = data.data
      } catch (e) {
        console.error(e)
      }
    },

    async requestForAuthorization() {
      if (!this.connection_request.app_id || !this.connection_request.app_secret) {
        alert('Please select an applicaton and enter the secret.')
        return
      }

      try {
        const { data } = await this.$axios.post('/dashboard/apps/authorize', this.connection_request)
        this.connection_request.app_secret = null
        this.connected_app = data.data
        this.initiatePusher()
        this.fetchDataForGraph(data.data.app_id)
        this.current_app_id = data.data.app_id
      } catch (e) {
        if (e.response && e.response.data) {
          alert(e.response.data.message)
        }
        console.error(e)
      }
    },

    initiatePusher() {
      if (!this.connected_app.api_key) {
        return
      }

      const scheme = process.env.VUE_APP_TLS === 'true' ? 'https' : 'http'

      const pusher = new Pusher(this.connected_app.api_key, {
        forceTLS: process.env.VUE_APP_TLS === 'true',
        wsHost: process.env.VUE_APP_SERVER_HOST,
        wsPort: process.env.VUE_APP_SERVER_PORT,
        wssPort: process.env.VUE_APP_SERVER_PORT,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${scheme}://${process.env.VUE_APP_SERVER_HOST}:${process.env.VUE_APP_SERVER_PORT}/apps/${this.connected_app.app_id}/authorize-channels`,
        auth: {
          headers: {
            Authorization: this.connected_app.access_token
          }
        }
      })

      pusher.connection.bind('connected', () => {
        this.connected = true
        this.renderChart()
      })

      pusher.connection.bind('disconnected', () => {
        console.log('websocket connection disconnected')
        this.connected = false
        this.chart = null
      })

      pusher.connection.bind('unavailable', () => {
        this.connected = false
        this.chart = null
      })

      pusher.connection.bind('connecting', () => {
        this.connected = false
        this.chart = null
      })

      this.pusher = pusher
      this.subscribeToChannels(this.connected_app.app_id)
      this.subscribeToLogs(this.connected_app.app_id)
      this.periodicStatUpdate(this.connected_app.app_id)
      this.updateDailyStats(this.connected_app.app_id)
    },

    subscribeToChannels(appId) {
      const channels = [
        `private-app-${appId}-stats-concurrent-connections`
      ]

      this.subscribeToStats(appId)
      channels.forEach((channel) => {
        this.subscribe(channel)
      })
    },

    subscribeToLogs(appId) {
      const channelName = `private-websockets-dashboard-${appId}`
      this.pusher.subscribe(channelName)
        .bind('log', (data) => {
          this.logs.unshift(data)
        })
    },

    subscribeToStats(appId) {
      const channelName = `private-app-${appId}-current-stats`
      this.pusher.subscribe(channelName)
        .bind('update', (data) => {
          const time = moment.unix(data.timestamp).format('DD-MM-YYYY HH:mm:ss')
          const update = {
            x: [[time], [time], [time]],
            y: [[data.peak_connections], [data.api_messages], [data.websocket_messages]]
          }
          Plotly.extendTraces('statisticsChart', update, [0, 1, 2])
          console.log('STAT_UPDATE', data)
        })
    },

    subscribe(channelName) {
      this.pusher.subscribe(channelName)
        .bind('update', (data) => {
          this.$set(this.connection_stats, 'concurrent', data.concurrent_connections)
        })
    },

    async renderChart() {
      const { peak_connection_stats, api_stats, websocket_message_stats } = await this.fetchDataForGraph(this.current_app_id)
      const xAxisData = peak_connection_stats.x.map(ts => moment.unix(ts).format('DD-MM-YYYY HH:mm:ss'));

      const chartData = [
        {
          x: xAxisData,
          y: peak_connection_stats.y,
          type: 'lines',
          name: '# Peak Connections'
        },
        {
          x: xAxisData,
          y: api_stats.y,
          type: 'bar',
          name: '# Api Messages'
        },
        {
          x: xAxisData,
          y: websocket_message_stats.y,
          type: 'bar',
          name: '# Websocket Messages'
        }
      ];
      const layout = {
        autosize: true,
        xaxis: {
          'tickformat': '%d/%m %I:%M'
        }
      }
      this.chart = Plotly.newPlot('statisticsChart', chartData, layout);
    },

    async handleSendEvent() {
      const payload = this.trigger_event_payload
      if (!payload.event || !payload.channel || !payload.data) {
        alert('Please fill out all the fields')
        return
      }

      await this.$axios.post(`/apps/${this.connected_app.app_id}/trigger-events`, payload, {
        headers: {
          Authorization: this.connected_app.access_token
        }
      })
    },

    async periodicStatUpdate(appId) {
      this.dailyStatTimer = setInterval( async () => {
        this.updateDailyStats(appId)
      }, 5000)
    },

    async updateDailyStats(appId) {
      const { data } = await this.$axios.get(`/apps/${appId}/daily-stats`, {
          headers: {
            Authorization: this.connected_app.access_token
          }
        })

        this.daily_stats = data.data
        this.connection_stats.concurrent = data.data.concurrent_connection
    },

    async fetchDataForGraph(appId) {
      const { data } = await this.$axios.get(`/apps/${appId}/graph`, {
        headers: {
          Authorization: this.connected_app.access_token
        }
      })

      return data.data
    }
  }
}
</script>