var planTypes = {
	PARALLEL_TASKS: 1,
	SERIAL_STEPS: 2
};


/**
 * The task queue.
 * Use it to synchronize function calls with many asynchronous sources.
 */
function createPlan() {
	var plan = [];
	plan.type = null;
	plan.updateCallbacks = [];
	plan.finishCallbacks = [];
	plan.unfinishedTaskCounter = 0;
	plan.currentStepNumber = 0;
	plan.addTask = addTask;
	plan.addStep = addStep;
	plan.run = runPlan;
	plan.update = setPlanUpdated;
	plan.finish = setPlanFinished;
	plan.onUpdate = doOnUpdate;
	plan.onFinish = doOnFinish;
	return plan;
}

/**
 * Method that allows user to add a task to the plan.
 * TaskFunction receives "task" callback as a first argument.
 * You shall call "task.done()" or "this.done()" after the TaskFunction ends.
 */
function addTask(taskFunction) {
	var plan = this;
	if (plan.type === null) {
		plan.type = planTypes.PARALLEL_TASKS;
	}
	if (plan.type === planTypes.PARALLEL_TASKS) {
		function createTask(plan, taskFunction) {
			var task = function () {
				taskFunction.call(task, task);
			};
			// there are three aliases. Is it a good idea or not?
			task.end = task.finish = task.done = endTask;
			task.plan = plan;
			task.isDone = false;
			return task;
		}
		plan.push(createTask(plan, taskFunction));
		plan.unfinishedTaskCounter++;
	} else {
		throw new Error("plan.js addTask: Illegal operation - adding task (parallel operation) to a serial plan. Only steps may be added to the serial plan.");
	}
}

/**
 * Method that allows user to add a step to the plan.
 * TaskFunction receives "step" callback as a first argument.
 * You shall call "step.done()" or "this.done()" after the StepFunction ends.
 */
function addStep(stepFunction) {
	var plan = this;
	if (plan.type === null) {
		plan.type = planTypes.SERIAL_STEPS;
	}
	if (plan.type === planTypes.SERIAL_STEPS) {
		function createStep(plan, stepFunction) {
			var step = function () {
				stepFunction.call(step, step);
			};
			// there are three aliases. Is it a good idea or not?
			step.end = step.finish = step.done = endStep;
			step.plan = plan;
	//		step.isDone = false;
			return step;
		}
		plan.push(createStep(plan, stepFunction));
	} else {
		throw new Error("plan.js addStep: Illegal operation - adding step (serial operation) to a parallel plan. Only tasks may be added to the parallel plan.");
	}
}

/**
 * Method that runs all tasks. Call it after the task list is prepared.
 */
function runPlan() {
	var plan = this;
	if (plan.type === planTypes.PARALLEL_TASKS) {
		for (var taskNumber = 0, l = plan.length; taskNumber < l; taskNumber++) {
			plan[taskNumber].call();
		}
	}
	if (plan.type === planTypes.SERIAL_STEPS) {
		plan[0].call();
	}
}

/**
 * This method adds a callback that is performed each time a task is finished
 */
function doOnUpdate(callbackFunction) {
	this.updateCallbacks.push(callbackFunction);
}

/**
 * This method adds a callback that is performed after all functions finish
 */
function doOnFinish(callbackFunction) {
	this.finishCallbacks.push(callbackFunction);
}

/**
 * Task method, that sets the task as finished.
 */
function endTask() {
	this.isDone = true;
	this.plan.unfinishedTaskCounter--;
	this.plan.update();
	if (this.plan.unfinishedTaskCounter === 0) {
		this.plan.finish();
	}
}

/**
 * Step method, that sets the step as finished.
 */
function endStep() {
	this.plan.currentStepNumber++;
	if (this.plan.currentStepNumber >= this.plan.length) {
		this.plan.finish();
	} else {
		this.plan[this.plan.currentStepNumber].call();
	}
}

/**
 * Method, that runs every time a task or step is finished.
 */
function setPlanUpdated() {
	for (var i = 0, l = this.updateCallbacks.length; i < l; i++) {
		this.updateCallbacks[i].call(this);
	}
}

/**
 * TaskList method, that runs once after the list is finished.
 */
function setPlanFinished() {
	for (var i = 0, l = this.finishCallbacks.length; i < l; i++) {
		this.finishCallbacks[i].call(this);
	}
}

exports.create = createPlan;
