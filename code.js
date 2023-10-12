const employee = [
  {
    shipmentDate: "20/09/2000",
    name: "Nguyen Van A",
    // ....
  },
  {
    shipmentDate: "20/09/2000",
    name: "Nguyen Van A",
    // ....
  },
  {
    shipmentDate: "20/09/2000",
    name: "Nguyen Van A",
    // ....
  },
  {
    shipmentDate: "20/09/2000",
    name: "Nguyen Van A",
    // ....
  },
  {
    shipmentDate: "20/09/2000",
    name: "Nguyen Van B",
    // ....
  },
];

const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

const group = groupBy(employee, "name");

console.log("group", group);
