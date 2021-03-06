
function InitError(raisedError, message) {
	this.prototype = Error.prototype;
	this.name = "InitError";
	this.message = message ? message : "No additional message provided";
	this.raisedError = raisedError;
	this.read = function () {
		if (raisedError.stackHistory != C.UNDEF) {
			this.raisedError.stack = this.raisedError.stackHistory;
		}
		//todo: make this not rely on pr() being defined!!
		pr(this.raisedError.message + ". \n\tWith trace: {0}".format(this.raisedError.stack), "InitError > {0}".format(this.raisedError.name), true);
	};

	return this;
}

function OrbImportError(raisedError, message) {
	this.prototype = Error.prototype;
	this.name = "OrbImportError";
	this.message = message ? message : "No additional message provided";
	this.raisedError = raisedError;
	this.read = function () {
		if (raisedError.stackHistory != C.UNDEF) {
			this.raisedError.stack = this.raisedError.stackHistory;
		}
	};

	return this;
}

function InelligbleOptError(raisedError, message) {
	this.prototype = Error.prototype;
	this.name = "InelligibleOptError";
	this.message = message ? message : "No additional message provided";
	this.raisedError = raisedError;
	this.read = function () {
		if (raisedError.stackHistory != C.UNDEF) {
			this.raisedError.stack = this.raisedError.stackHistory;
		}
	};

	return this;
}