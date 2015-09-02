'use strict';

(function() {
	// Metrics Controller Spec
	describe('Metrics Controller Tests', function() {
		// Initialize global variables
		var MetricsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Metrics controller.
			MetricsController = $controller('MetricsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Metric object fetched from XHR', inject(function(Metrics) {
			// Create sample Metric using the Metrics service
			var sampleMetric = new Metrics({
				name: 'New Metric'
			});

			// Create a sample Metrics array that includes the new Metric
			var sampleMetrics = [sampleMetric];

			// Set GET response
			$httpBackend.expectGET('metrics').respond(sampleMetrics);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.metrics).toEqualData(sampleMetrics);
		}));

		it('$scope.findOne() should create an array with one Metric object fetched from XHR using a metricId URL parameter', inject(function(Metrics) {
			// Define a sample Metric object
			var sampleMetric = new Metrics({
				name: 'New Metric'
			});

			// Set the URL parameter
			$stateParams.metricId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/metrics\/([0-9a-fA-F]{24})$/).respond(sampleMetric);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.metric).toEqualData(sampleMetric);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Metrics) {
			// Create a sample Metric object
			var sampleMetricPostData = new Metrics({
				name: 'New Metric'
			});

			// Create a sample Metric response
			var sampleMetricResponse = new Metrics({
				_id: '525cf20451979dea2c000001',
				name: 'New Metric'
			});

			// Fixture mock form input values
			scope.name = 'New Metric';

			// Set POST response
			$httpBackend.expectPOST('metrics', sampleMetricPostData).respond(sampleMetricResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Metric was created
			expect($location.path()).toBe('/metrics/' + sampleMetricResponse._id);
		}));

		it('$scope.update() should update a valid Metric', inject(function(Metrics) {
			// Define a sample Metric put data
			var sampleMetricPutData = new Metrics({
				_id: '525cf20451979dea2c000001',
				name: 'New Metric'
			});

			// Mock Metric in scope
			scope.metric = sampleMetricPutData;

			// Set PUT response
			$httpBackend.expectPUT(/metrics\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/metrics/' + sampleMetricPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid metricId and remove the Metric from the scope', inject(function(Metrics) {
			// Create new Metric object
			var sampleMetric = new Metrics({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Metrics array and include the Metric
			scope.metrics = [sampleMetric];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/metrics\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleMetric);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.metrics.length).toBe(0);
		}));
	});
}());