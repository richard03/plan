var plan = require('../src/plan.js');

exports.tasks = function (test) {
	var buffer = [];
	var expectedStr = '14352';

	var testPlan = plan.create();

	testPlan.addTask(function (task) {
		setTimeout(function () {
			buffer.push('1');
			task.done();
		}, 10);
	});
	testPlan.addTask(function (task) {
		setTimeout(function () {
			buffer.push('2');
			task.done();
		}, 50);
	});
	testPlan.addTask(function (task) {
		setTimeout(function () {
			buffer.push('3');
			task.done();
		}, 30);
	});
	testPlan.addTask(function (task) {
		setTimeout(function () {
			buffer.push('4');
			task.done();
		}, 20);
	});
	testPlan.addTask(function (task) {
		setTimeout(function () {
			buffer.push('5');
			task.done();
		}, 40);
	});

	testPlan.onFinish(function () {
		test.equals(buffer.join(''), expectedStr, "All tasks in plan shall run parallel, plan.onFinish shall run after all tasks are finished.");
		test.done();
	});

	testPlan.run();
};

exports.steps = function (test) {
	var buffer = [];
	var expectedStr = '12345';

	var testPlan = plan.create();

	testPlan.addStep(function (step) {
		setTimeout(function () {
			buffer.push('1');
			step.done();
		}, 10);
	});
	testPlan.addStep(function (step) {
		setTimeout(function () {
			buffer.push('2');
			step.done();
		}, 50);
	});
	testPlan.addStep(function (step) {
		setTimeout(function () {
			buffer.push('3');
			step.done();
		}, 30);
	});
	testPlan.addStep(function (step) {
		setTimeout(function () {
			buffer.push('4');
			step.done();
		}, 20);
	});
	testPlan.addStep(function (step) {
		setTimeout(function () {
			buffer.push('5');
			step.done();
		}, 40);
	});

	testPlan.onFinish(function () {
		test.equals(buffer.join(''), expectedStr, "Plan steps shall run one after another, plan.onFinish shall run after last step is finished.");
		test.done();
	});

	testPlan.run();
};