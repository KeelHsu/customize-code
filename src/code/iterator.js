/*
*simple array iterator
*/
export function arrayIterator() {
  let currentIndex = 0,
    done = false

  let next = () => {
    let value = this[currentIndex];
    done = done || (currentIndex++ > this.length);

    console.log('next',value)

    return result(value);
  }

  let thrower = error => {
    console.log('throw',error)
    throw error;
  }

  let returner = value => {
    done = true;

    console.log('return',value)

    return result(value);
  }

  let result = value => {
    return { value, done }
  }

  return {
    next,
    throw: thrower,
    return: returner
  }
}

/*
*Object iterators
*/
export function objectKeysIterator() {
  return Object.keys(this)[Symbol.iterator]()
}

export function objectValuesIterator() {
  return Object.values(this)[Symbol.iterator]()
}

export function objectEntriesIterator() {
  return Object.entries(this)[Symbol.iterator]()
}