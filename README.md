#targets-io #
##Performance test dashboard

Dashboard app for organising, analysing, and benchmarking of test results of performance tests executed with Gatling Tool or JMeter.
The load related metrics are stored in Graphite along with for instance resource usage metrics of the application under test.
Any metric stored in Graphite can be benchmarked between test runs, to provide automated feedback on the performance of an application.

**Demo**

To set up a local demo environment take the following steps (instructions for linux Ubuntu, use this [Vagrantfile](https://github.com/dmoll1974/targets-io/blob/master/Vagrantfile) to generate a box):

- [Install docker](http://docs.docker.com/linux/step_one/)  
- [Install docker compose](https://github.com/docker/compose/releases)
- Clone this repository
- Run init script to prepare Graphite volumes on host

  `sudo chmod +x init-graphite-container-volumes.sh`
  
  `sudo ./init-graphite-container-volumes.sh`
- Run docker compose  `sudo docker-compose up`


This fires up 6 docker containers:

| Container  	| Description                                            	| port  	|
|------------	|--------------------------------------------------------	|-------	|
| targets-io 	| Performance dashboard application                      	| 3000  	|
| mongodb    	| Database to store dashboard configurations           		| 27017 	|
| graphite   	| Time based series database                             	| 8090  	|
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
Click "Add maven", make sure "install automatically" is checked an provide a name for the installation and select version *3.3.1*. Then save the configuration.

To start Gatling or Jmeter tests click on one of DEMO-GATLING or DEMO-JMETER jobs and click "Build now"

This will trigger the [Gatling demo script](https://github.com/dmoll1974/gatling-demo-script) or the [JMeter demo script](https://github.com/dmoll1974/jmeter-demo-script). 

To see a demo of the automated assertion of benchmark results, some additional steps are required:

- Run the DEMO-GATLING-BENCHMARKING-MULTIJOB job
- After the first run has finished, go to `http://localhost:3000/#!/browse/GATLING/LOAD`to check the results.
- Rerun the the DEMO-GATLING-BENCHMARKING-MULTIJOB multi-job
- When the Jenkins build passes it means all your configured requirements / benchmark thresholds (see explanation below) have passed for this run. If the job fails, check the DEMO-GATLING-GET-BENCHMARKING-RESULTS job logs to find out why :-)

**Benchmarking**

The targets-io dashboard can automatically benchmark test results to prevent you from spending a lot of time analysing your continuous performance test runs. The dashboard does the following benchmarks:

- Requirements: check if the results meet the requirements set for a metric. 
- Benchmark to previous test run: check if metric deviations, compared to the last test run, stay within configured allowed deviation. This benchmark will give you immediate feedback on the last commits on your code.
- Benchmark to fixed baseline: check if metric deviations, compared to fixed baseline (for instance your current live version), stay within configured allowed deviation.
 
The requirements / benchmark thresholds can be set on any of the metrics you have configured in your dashboard. To check or modify these, go to the METRICS CONFIGURATION section of the dashboard.


**Libraries / Dependencies**
------------------------
+ [Meanjs](https://github.com/meanjs/mean)
+ [Dygraphs] (http://dygraphs.com/) 
+ [Angular-Material] (https://github.com/angular/material)
+ [Twitter Bootstrap] (http://twitter.github.com/bootstrap/)
+ [ngTagsInput] (https://github.com/mbenford/ngTagsInput)
+ [ng-clip] (https://github.com/asafdav/ng-clip)
+ [bootstrap-ui-datetime-picker] (https://github.com/Gillardo/bootstrap-ui-datetime-picker)

**Documentation**

[Wiki](https://github.com/dmoll1974/targets-io/wiki)

## License

[MIT license](https://github.com/dmoll1974/targets-io/blob/master/LICENSE.md)
