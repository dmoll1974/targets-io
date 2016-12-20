#targets-io #
##Performance test dashboard

Dashboard app for organizing, analyzing, benchmarking and reporting of test results of performance tests executed with Gatling Tool, JMeter or LoadRunner (see [LR2Graphite](https://github.com/ogarling/LR2Graphite) and [LRLauncher](https://github.com/ogarling/LR2Graphite/wiki)).
The load related metrics are stored in Graphite together with for instance resource usage metrics of the application under test.
Any metric stored in Graphite can be benchmarked between test runs, to provide automated assertions on the performance of an application when running tests from a continuous integration pipeline. 

**Benchmarking**

The targets-io dashboard can automatically benchmark test results to prevent you from spending a lot of time analysing your continuous performance test runs. The dashboard does the following benchmarks:

- Requirements: check if the results meet the requirements set for a metric. 
- Benchmark to previous test run: check if metric deviations, compared to the last test run, stay within configured allowed deviation. This benchmark will give you immediate feedback on the last commits on your code.
- Benchmark to fixed baseline: check if metric deviations, compared to fixed baseline (for instance your current live version), stay within configured allowed deviation.
 
The requirements / benchmark thresholds can be set on any of the metrics you have configured in your dashboard. 
The consolidated test run results are exposed via a REST API and can be used to pass or fail your build in your CI server.

**Demo**

To set up a local demo environment take the following instruction steps for Linux Ubuntu:  
- [Install docker](https://docs.docker.com/engine/installation/linux/ubuntulinux/)  
- [Install docker compose](https://docs.docker.com/compose/install/)
- Clone this repository: `git clone https://github.com/dmoll1974/targets-io.git`
- Change directory into targets-io: `cd targets-io`
- Run init script to prepare Graphite volumes on host:   `sudo ./init-graphite-container-volumes.sh`
- Run docker compose: `sudo docker-compose up -d`

or

Another approach is to use [Vagrant](http://www.vagrantup,com) and [VirtualBox](https://www.virtualbox.org/) to create a virtual machine. This way the setting up of the environment is completely automated. You can use the following steps:
- Install [Vagrant](http://www.vagrantup,com) and [VirtualBox](https://www.virtualbox.org/)
- Install the [vagrant-docker-compose](https://github.com/leighmcculloch/vagrant-docker-compose) plugin using the command line: `vagrant plugin install vagrant-docker-compose`  
- Use this [Vagrantfile](https://raw.githubusercontent.com/dmoll1974/targets-io/master/Vagrantfile) to generate a box. Place file in a directory of your choosing and use command line in that directory: `vagrant up`.  

> shortcut using curl: `curl -O https://raw.githubusercontent.com/dmoll1974/targets-io/master/Vagrantfile && vagrant up`

The end result will be 6 started docker containers:

| Container  	| Description                                            	| port  	|
|------------	|--------------------------------------------------------	|-------	|
| targets-io 	| Performance dashboard application                      	| 3000  	|
| mongodb    	| Database to store dashboard configurations           		 | 27017 	|
| graphite   	| Time based series database                             	| 8090  	|
| jenkins    	| CI server to start demo scripts     	                   | 8080  	|
| mean       	| Demo application to run performance tests against 	     | 3001  	|
| redis      	| Used for caching calls to Graphite                     	| 6379   |


Open the targets-io performance dashboard via

`http://localhost:3000`

First restore the pre-configured demo dashboard configurations via the menu in the right top of the screen

Select the configuration file from the repo (targets-io/demo/targets-io-demo.json) and click "upload me". After reloading the page you should see one "Product": "MEAN"

To start one of the demo scripts open the Jenkins console

`http://localhost:8080` 

Log in using the credentials admin/targets-io

***Assertions demo*** 

To see a demo of the automated assertion of benchmark results of a test run, start the TARGETS-IO-GATLING-DEMO job (click "Build now"). This will trigger the [Gatling demo script](https://github.com/dmoll1974/targets-io-demo-script-gatling)

- After the first run has finished, go to `http://localhost:3000/#!/browse/MEAN/GATLING-NIGHTLY/`to check the results.
- Rerun the the TARGETS-IO-GATLING-DEMO job.
- When this build passes it means all your configured requirements / benchmark thresholds (see explanation above) have passed for this run. If the job fails, check the job logs to find out why and examine  `http://localhost:3000/#!/browse/MEAN/GATLING-NIGHTLY/` to investigate. You can drill down the consolidated results by clicking on the passed/failed icons. 

***JMeter integration demo*** 

The TARGETS-IO-JMETER-DEMO job triggers the [JMeter demo script](https://github.com/dmoll1974/jmeter-demo-script) to demo how to integrate a JMeter script in the framework.

***LoadRunner integration demo*** 

The TARGETS-IO-LOADRUNNER-DEMO job triggers the [LoadRunner TruClient demo script](https://github.com/dmoll1974/targets-io-demo-truclient) to demo how to integrate a LoadRunner script in the framework. This requires a Windows Jenkins Agent to be connected as "LOADRUNNER-SLAVE". Please refer to the [LR2Graphite documentattion](https://github.com/ogarling/LR2Graphite) on how to setup this machine.


***Update your demo environment*** 

The [targets-io image on Docker hub](https://hub.docker.com/r/dmoll1974/targets-io/) is updated frequently. To deploy the latest version in your demo environment, use `sudo docker-compose stop targetsio`, `sudo docker-compose pull targetsio` and `sudo docker-compose up -d` to update!  

##Documentation

[Wiki](https://github.com/dmoll1974/targets-io/wiki) (in progress)


##Libraries / Dependencies

+ [Meanjs](https://github.com/meanjs/mean)
+ [Dygraphs] (http://dygraphs.com/) 
+ [Angular-Material] (https://github.com/angular/material)
+ [Twitter Bootstrap] (http://twitter.github.com/bootstrap/)
+ [ngTagsInput] (https://github.com/mbenford/ngTagsInput)
+ [ng-clip] (https://github.com/asafdav/ng-clip)
+ [sc-date-time] (https://github.com/SimeonC/sc-date-time)
+ [Socket.io](http://socket.io/)
+ [Showdown](https://github.com/showdownjs/showdown)
+ [ng-sortable](https://github.com/a5hik/ng-sortable)
+ [pdfMake](http://pdfmake.org/#/)


##License

[GNU GPL](https://github.com/dmoll1974/targets-io/blob/master/LICENSE.md)
