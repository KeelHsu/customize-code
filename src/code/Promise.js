/*
自定义Promise
*/

// todo 处理thenable

var PENDING = 'pending';
var FULFILLED = 'resolved';
var REJECTED = 'rejected';

function timer(callback) {
  setTimeout(callback, 0);
}

function settle(state, result) {
  if (state === PENDING || this.state !== PENDING) {
    return;
  }
  this.state = state;
  this.data = result;

  // 这里其实有一点点风险，new Promise的时候如果catch到这里的异常会导致reject，
  // 但是之所以说是一点点风险，是因为只要保证自己的foreach代码和run代码不抛异常就可以，这很好保证，
  // then函数传入的回调会进入异步执行，同步的try是catch不到的，
  // 风险是可控的。(也是因为还没想到怎么把这一块逻辑剥离出来。。。)
  this.handlers.forEach(function (item) {
    item.run();
  })
}

function Promise(executor) {
  this.data = undefined;
  this.state = PENDING;
  this.handlers = [];
  var resolve = settle.bind(this, FULFILLED);
  var reject = settle.bind(this, REJECTED);

  try {
    executor(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

Promise.prototype.__MYPROMISE__ = true;

Promise.prototype.then = function (onFulfilled, onRejected) {
  var handler = new Handler(onFulfilled, onRejected, this);
  return handler.init();
}

Promise.prototype.catch = function (onRejected) {
  return Promise.prototype.then.call(this, null, onRejected);
}

Promise.resolve = function (value) {
  if (typeof value === 'object' && value instanceof Promise) {
    return value;
  }
  return new Promise(function (resolve, reject) {
    resolve(value);
  })
}

Promise.reject = function (error) {
  return new Promise(function (resolve, reject) {
    reject(error);
  })
}

Promise.all = function (promises) {
  if (typeof promises !== 'object' || !promises instanceof Array) {
    throw new TypeError('not an array');
  }

  var length = promises.length,
    results = new Array(length),
    times = 0;

  return new Promise(function (resolve, reject) {
    // 传入空数组直接resolve
    length || resolve([]);

    promises.forEach(function (pr, i) {
      pr.then(function (value) {
        results[i] = value;
        if (++times === length) {
          resolve(results);
        }
      }, function (reason) {
        reject(reason);
      }
      )
    })
  })
}

Promise.race = function (promises) {
  if (typeof promises !== 'object' || !promises instanceof Array) {
    throw new TypeError('not an array');
  }

  return new Promise(function (resolve, reject) {
    promises.forEach(function (pr) {
      pr.then(function (value) {
        resolve(value);
      }, function (reason) {
        reject(reason);
      }
      )
    })
  })
}


function Handler(onFulfilled, onRejected, context) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : returner;
  this.onRejected = typeof onRejected === 'function' ? onRejected : thrower;
  this.context = context;

  function returner(value) {
    return value;
  }

  function thrower(error) {
    throw error;
  }
}

Handler.prototype.init = function () {
  var self = this,
    pr = self.context,
    onFulfilled = self.onFulfilled,
    onRejected = self.onRejected;

  return new Promise(function (resolve, reject) {
    self.onFulfilled = function () {
      try {
        resolve(onFulfilled.call({}, pr.data));
      } catch (error) {
        reject(error);
      }
    }

    self.onRejected = function () {
      try {
        resolve(onRejected.call({}, pr.data));
      } catch (error) {
        reject(error);
      }
    }

    self.run();
  })
}

Handler.prototype.run = function () {
  var self = this,
    pr = self.context;
  if (pr.state === PENDING) {
    pr.handlers.push(self);
  }
  if (pr.state === FULFILLED) {
    timer(self.onFulfilled);
  }
  if (pr.state === REJECTED) {
    timer(self.onRejected);
  }
}

export default Promise;
