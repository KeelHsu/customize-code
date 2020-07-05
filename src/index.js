import Promise from "./code/Promise";

var a = new Promise(function (resolve, reject) {
  resolve(1)
})
var b = new Promise(function (resolve, reject) {
  reject(3)
})
var c = new Promise(function (resolve, reject) {
  resolve(2)
})


var b = Promise.race([a,b,c])
b.then(
  // v => {
  //   console.log('resolve1', v);
  // }, v => {
  //   console.log('reject1', v);
  // }
).then(
  v => {
    console.log('resolve2', v);
  }, v => {
    console.log('reject2', v);
  }
)
