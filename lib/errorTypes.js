'use strict';

function InvalidRequestError(message){
  this.name = 'InvalidRequestError';
  this.message = message || 'Invalid request';
}
InvalidRequestError.prototype = Object.create(Error.prototype);
InvalidRequestError.prototype.constructor = InvalidRequestError;

exports.InvalidRequestError = InvalidRequestError;

function InternalServerError(message){
  this.name = 'InternalServerError';
  this.message = message || 'Internal server error';
}
InternalServerError.prototype = Object.create(InvalidRequestError.prototype);
InternalServerError.prototype.constructor = InternalServerError;

exports.InternalServerError = InternalServerError;

function MethodNotAllowed(message){
  this.name = 'MethodNotAllowed';
  this.message = message || 'Method not allowed';
}
MethodNotAllowed.prototype = Object.create(InvalidRequestError.prototype);
MethodNotAllowed.prototype.constructor = MethodNotAllowed;

exports.MethodNotAllowed = MethodNotAllowed;

function ResourceNotFound(message){
  this.name = 'ResourceNotFound';
  this.message = message || 'Resource not found';
}
ResourceNotFound.prototype = Object.create(InvalidRequestError.prototype);
ResourceNotFound.prototype.constructor = ResourceNotFound;

exports.ResourceNotFound = ResourceNotFound;

function Unauthorized(message) {
	this.name = 'Unauthorized';
	this.message = message || 'User not authorized';
}
Unauthorized.prototype = Object.create(InvalidRequestError.prototype);
Unauthorized.prototype.constructor = Unauthorized;

exports.Unauthorized = Unauthorized;