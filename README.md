#targets-io #
##Performance test dashboard

Dashboard app for organising, analysing, and benchmarking of test results of performance tests executed with Gatling Tool or JMeter.
The load related metrics are stored in Graphite along with for instance resource usage metrics of the application under test.
Any metric stored in Graphite can be benchmarked between test runs, to provide automated feedback on the performance of an application.

**Demo**

To set up a local demo environment take the following steps (instructions for linux Ubuntu):

- [Install docker](http://docs.docker.com/linux/step_one/)  
- [Install docker compose](https://github.com/docker/compose/releases)
- Clone this repository
- Run docker compose  `sudo docker-compose up`


This fires up 7 docker containers:

| Container  	| Description                                            	| port  	|
|------------	|--------------------------------------------------------	|-------	|
| targets-io 	| Performance dashboard application                      	| 3000  	|
| mongodb    	| Database to store dashboard configurations           		| 27017 	|
| graphite   	| Time based series database                             	| 8090  	|
| memcached  	| Distributed cache between targets-io and Graphite      	| 11211 	|
| jenkins    	| CI server to start demo Gatling and Jmeter scripts     	| 8070  	|
| dropwizard 	| Demo rest application to run performance tests against 	| 8080  	|
| jmxtrans   	| Pushes dropwizard JVM metrics to graphite              	| n/a   	|


Open the targets-io performance dashboard via

`http://localhost:3000`

First restore the pre-configured demo dashboard configurations via the menu in the right top of the screen

Select the configuration file from the repo (targets-io/demo/targets-io-demo.dump) and click "upload me". After reloading the page you should see two "Products", "GATLING" and "JMETER"

To start one of the demo scripts open the Jenkins console

`http://localhost:8070` 

Go to the configuration page `http://localhost:8070/configure` and scroll down to the Maven section.
Click "Add maven", make sure "install automatically" is checked an provide a name for the installation. Then save the configuration.

To start Gatling or Jmeter tests click on of the corresponding jobs and click "Build now"

This will trigger the [Gatling demo script](https://github.com/dmoll1974/gatling-demo-script) or the [JMeter demo script](https://github.com/dmoll1974/jmeter-demo-script)

**Libraries / Dependencies**
------------------------
+ Meanjs [https://github.com/meanjs/mean]
+ highcharts-ng [https://github.com/pablojim/highcharts-ng] *NOTE: Not free for commercial use.  See this page for licensing details: http://shop.highsoft.com/highcharts.html*
+ Angular-Material [https://github.com/angular/material]
+ Twitter Bootstrap [http://twitter.github.com/bootstrap/]
+ ngTagsInput [https://github.com/mbenford/ngTagsInput]
+ ng-clip [https://github.com/asafdav/ng-clip]
+ bootstrap-ui-datetime-picker [https://github.com/Gillardo/bootstrap-ui-datetime-picker]

**Documentation**

TBD
## License

MIT license [https://github.com/dmoll1974/targets-io/edit/master/license.md]
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
