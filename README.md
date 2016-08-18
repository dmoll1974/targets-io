#targets-io #
##Performance test dashboard

Dashboard app for organising, analysing, and benchmarking of test results of performance tests executed with Gatling Tool, JMeter or LoadRunner (see [lr2graphite](https://github.com/ogarling/LR2Graphite)).
The load related metrics are stored in Graphite along with for instance resource usage metrics of the application under test.
Any metric stored in Graphite can be benchmarked between test runs, to provide automated assertions on the performance of an application when running tests from a continuous integration pipeline. 

**Benchmarking**

The targets-io dashboard can automatically benchmark test results to prevent you from spending a lot of time analysing your continuous performance test runs. The dashboard does the following benchmarks:

- Requirements: check if the results meet the requirements set for a metric. 
- Benchmark to previous test run: check if metric deviations, compared to the last test run, stay within configured allowed deviation. This benchmark will give you immediate feedback on the last commits on your code.
- Benchmark to fixed baseline: check if metric deviations, compared to fixed baseline (for instance your current live version), stay within configured allowed deviation.
 
The requirements / benchmark thresholds can be set on any of the metrics you have configured in your dashboard. 

**Demo**

To set up a local demo environment take the following steps (instructions for linux Ubuntu. If you use this [Vagrantfile](https://github.com/dmoll1974/targets-io/blob/master/Vagrantfile) to generate a box, you can skip the first two steps. This vagrant file requires the vagrant docker-compose plugin, `vagrant plugin install vagrant-docker-compose`):

- [Install docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/)  
- [Install docker compose](https://docs.docker.com/compose/install/)
- Clone this repository
- Run init script to prepare Graphite volumes on host

  `sudo chmod +x init-graphite-container-volumes.sh`
  
  `sudo ./init-graphite-container-volumes.sh`
- Run docker compose  `sudo docker-compose up -d`


This fires up 6 docker containers:

| Container  	| Description                                            	| port  	|
|------------	|--------------------------------------------------------	|-------	|
| targets-io 	| Performance dashboard application                      	| 3000  	|
| mongodb    	| Database to store dashboard configurations           		 | 27017 	|
| graphite   	| Time based series database                             	| 8090  	|
| jenkins    	| CI server to start demo Gatling scripts     	           | 8070  	|
| mean       	| Demo application to run performance tests against 	     | 3001  	|
| redis      	| Used for caching calls to Graphite                     	| 6379   |


Open the targets-io performance dashboard via

`http://localhost:3000`

First restore the pre-configured demo dashboard configurations via the menu in the right top of the screen

Select the configuration file from the repo (targets-io/demo/targets-io-demo-new.json) and click "upload me". After reloading the page you should see one "Product": "GATLING"

To start one of the demo scripts open the Jenkins console

`http://localhost:8070` 

Log in using the credentials admin/targets-io

To see a demo of the automated assertion of benchmark results run, start the TARGETS-IO-DEMO job (click "Build now"). This will trigger the [Gatling demo script](https://github.com/dmoll1974/targets-io-demo-script-gatling)

- The first time the job runs, the "Assert results" stage will fail, because there are no test runs yet to benchmark against. 
- After the first run has finished, go to `http://localhost:3000/#!/browse/GATLING/NIGHTLY`to check the results.
- Rerun the the TARGETS-IO-DEMO job.
- When this build passes it means all your configured requirements / benchmark thresholds (see explanation below) have passed for this run. If the job fails, check the "Assert results" job logs to find out why and examine  `http://localhost:3000/#!/browse/GATLING/NIGHTLY` to investigate. You can drill down the consolidated results by clicking on the passed/failed icons. 

To update: Check [targets-io on Docker hub](https://hub.docker.com/r/dmoll1974/targets-io/) if the targets-io image has been updated recently. If so, use `sudo docker-compose stop targetsio`, `sudo docker-compose pull targetsio` and `sudo docker-compose up -d` to update your demo environment to the latest version!  

##Documentation

[Wiki](https://github.com/dmoll1974/targets-io/wiki) (in progress)


##Libraries / Dependencies

+ [Meanjs](https://github.com/meanjs/mean)
+ [Dygraphs] (http://dygraphs.com/) 
+ [Angular-Material] (https://github.com/angular/material)
+ [Twitter Bootstrap] (http://twitter.github.com/bootstrap/)
+ [ngTagsInput] (https://github.com/mbenford/ngTagsInput)
+ [ng-clip] (https://github.com/asafdav/ng-clip)
+ [bootstrap-ui-datetime-picker] (https://github.com/Gillardo/bootstrap-ui-datetime-picker)
+ [Socket.io](http://socket.io/)
+ [Showdown](https://github.com/showdownjs/showdown)



##License

[MIT license](https://github.com/dmoll1974/targets-io/blob/master/LICENSE.md)
