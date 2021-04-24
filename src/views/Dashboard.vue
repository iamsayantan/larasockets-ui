<template>
  <div class="container-fluid">
    <!-- if you need full page then replace class container-fluid with container and give appropriate margin and padding -->
    <!-- 1st block -->
    <div class="row m-1 p-2" style="background-color:#F7F7F7;">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12" >
        <form class="form-inline m-md-3 m-lg-3 m-xl-3">
          <div class="form-group mx-sm-1 m-md-1 m-lg-1 m-xl-1">
            <label for="inputState">App</label>
            <select id="inputState" class="form-control ml-md-2 ml-lg-2 ml-xl-2">
              <option selected>Choose...</option>
              <option>Laravel</option>
            </select>
          </div>
          <div class="form-group mx-sm-1">
            <label for="port">Port</label>
            <input type="number" class="form-control ml-md-2 ml-lg-2 ml-xl-2" id="port" placeholder="Port">
          </div>
          <div class="form-group mx-sm-1">
            <button type="submit" class="btn btn-success customeclass">Connect</button>
          </div>

        </form>
        <div class="row  text-center">
          <div class="col-sm-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title font-weight-bold">Concurrent Connections</h5>
                <p class="card-text" style="font-size: 40px">200</p>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title font-weight-bold">Peak Connections</h5>
                <p class="card-text" style="font-size: 40px">550</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- end of first block -->
    <!-- graph block -->
    <div class="row m-1 p-2">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
        <div id="chart" ref="chart"></div>
      </div>
    </div>
    <!-- end of graph block -->
    <!-- event creator -->
    <div class="row m-1 p-2">
      <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
        <h4>Event Creator</h4>
        <form>
          <div class="form-row">
            <div class="form-group col-md-6">
              <input type="email" class="form-control" id="channel" placeholder="Channel">
            </div>
            <div class="form-group col-md-6">
              <input type="password" class="form-control" id="event" placeholder="Event">
            </div>
            <div class="form-group col-md-12">
              <textarea class="form-control" placeholder="Data" id="exampleFormControlTextarea1" rows="4"></textarea>
            </div>
            <div class="form-group col-md-12 d-flex justify-content-end">
              <button type="submit" class="btn btn-primary mb-2">Send Event</button>
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
              <th scope="col">Sockets</th>
              <th scope="col">Details</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                <span class="badge badge-secondary">api-message</span>
              </th>
              <td>Mark</td>
              <td>Otto</td>
              <td>@mdo</td>
            </tr>
            <tr>
              <th scope="row"><span class="badge badge-warning">Vacated</span></th>
              <td>-</td>
              <td>Channel private: chat-1</td>
              <td>1:05:06</td>
            </tr>
            <tr>
              <th scope="row"><span class="badge">Disconnection</span></th>
              <td>Larry</td>
              <td>the Bird</td>
              <td>@twitter</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- end event table -->
  </div>
</template>
<script>
import ApexCharts from 'apexcharts'

export default {
  name: "Dashboard",
  data() {
    return {
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
            show: false
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
    const chart = new ApexCharts(this.$refs.chart, this.chartOptions)
    chart.render()
  },
}
</script>