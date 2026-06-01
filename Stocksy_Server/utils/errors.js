// utils/errors.js
class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError'; }
}
class InsufficientFundsError extends Error {
  constructor(message) { super(message); this.name = 'InsufficientFundsError'; }
}
class MarketClosedError extends Error {
  constructor() { super('Market is currently closed'); this.name = 'MarketClosedError'; }
}
module.exports = { ValidationError, InsufficientFundsError, MarketClosedError };
