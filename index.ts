interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  move: (employeeId: number, supervisorId: number) => void;
  undo: () => void;
  redo: () => void;
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;

  constructor(ceo: Employee) {
    this.ceo = ceo
  }

  findShortestPathEmp(root: Employee, empId: number, path: number[] = [], empObj?: Employee): {path: number[], employee: Employee} | null {

    if (root?.uniqueId === empId) {
        root.subordinates.push({...empObj, subordinates: []})
        return {
          path,
          employee: root
        }
    }

    for (let i = 0; i < root?.subordinates?.length; i++) {
        const newPath = [...path, i];
        const found = this.findShortestPathEmp(root.subordinates[i], empId, newPath, empObj);
        if (found) {
            return found;
        }
    }
    return null;
  }

  removeEmployee(root: Employee, pathIndices: number[]): void {
    let employee = root;
    let parent = null;

    pathIndices.forEach(index => {
      if (employee && employee.subordinates[index]) {
        parent = employee;
        
        employee = employee.subordinates[index];

      } else {
        return false;
      }
    })



    if (parent) {
      parent.subordinates.splice(pathIndices[pathIndices.length-1],1);
      const empSub = [...employee.subordinates].filter(emp => emp.uniqueId)
      parent.subordinates.push(empSub);
    }
  }

  move(employeeId: number, supervisorId: number): Employee {
    const deppCeo = JSON.parse(JSON.stringify(this.ceo));
    const shortestPathEmp = this.findShortestPathEmp(deppCeo, employeeId)
    const tempEmp: Employee = shortestPathEmp.employee 
    this.removeEmployee(deppCeo, shortestPathEmp.path)
    this.findShortestPathEmp(deppCeo , supervisorId, [], tempEmp)

    console.dir(deppCeo, {depth: null})

    return deppCeo;
  }

  redo(): void {
    console.log("redo");
  }

  undo(): void {
    console.log("undo");
  }
}

const ceo = {
    uniqueId: 1,
    name: "Mark Zuckerberg",
    subordinates: [
      {
        uniqueId: 2,
        name: 'Sarah Donald',
        subordinates: [
          {
            uniqueId: 3,
            name: "Cassandra Reynolds",
            subordinates: [
              {
                uniqueId: 4,
                name: 'Mary Blue',
                subordinates: []
              },
              {
                uniqueId: 5,
                name: 'Bob Saget',
                subordinates: [
                  {
                    uniqueId: 6,
                    name: 'Tina Teff',
                    subordinates: [
                       {
                        uniqueId: 7,
                        name: 'Will Turner',
                        subordinates: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        uniqueId: 8,
        name: 'Tyler Simpson',
        subordinates: [
          {
            uniqueId: 9,
            name: 'Harry Tobs',
            subordinates: [
              {
                uniqueId: 10,
                name: "Thomas Brown",
                subordinates: []
              }
            ]
          },
          {
            uniqueId: 11,
            name: "George Carrey",
            subordinates: []
          },
          {
            uniqueId: 12,
            name: "Gary Styles",
            subordinates: []
          }
        ]
      },
      {
        uniqueId: 13,
        name: "Bruce Wilis",
        subordinates: []
      },
      {
        uniqueId: 14,
        name: "Georgina Flangy",
        subordinates: [
          {
            uniqueId: 15,
            name: "Sophie Turner",
            subordinates: []
          }
        ]
      }
    ]
  }

  
  const app = new EmployeeOrgApp(ceo)
  app.move(6,9)
  