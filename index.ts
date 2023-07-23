interface Employee {
    uniqueId: number;
    name: string;
    subordinates: Employee[];
    parentId?: number;
}

interface IEmployeeOrgApp {
    ceo: Employee;
    move: (employeeId: number, supervisorId: number) => void;
    undo: () => void;
    redo: () => void;
}

interface MoveOperation {
    type: "move";
    employeeId: number;
    supervisorId: number
    prevParentEmployeePath: number[];
}

class EmployeeOrgApp implements IEmployeeOrgApp {
    ceo: Employee;
    moveOperations: MoveOperation[];
    redoOperations: MoveOperation[];

    constructor(ceo: Employee) {
        this.ceo = ceo;
        this.moveOperations = [];
        this.redoOperations = [];
    }

    findShortestPathEmp(
        root: Employee,
        empId: number,
        path: number[] = [],
        empObj?: Employee
    ): { path: number[]; employee: Employee } | null {
        if (root?.uniqueId === empId) {
            root.subordinates.push({ ...empObj, subordinates: [] });
            return {
                path,
                employee: root,
            };
        }

        for (let i = 0; i < root?.subordinates?.length; i++) {
            const newPath = [...path, i];
            const found = this.findShortestPathEmp(
                root.subordinates[i],
                empId,
                newPath,
                empObj
            );
            if (found) {
                return found;
            }
        }
        return null;
    }

    removeEmployee(root: Employee, pathIndices: number[]): void {
        let employee = root;
        let parent = null;

        pathIndices.forEach((index) => {
            if (employee && employee.subordinates[index]) {
                parent = employee;

                employee = employee.subordinates[index];
            } else {
                return false;
            }
        });

        if (parent) {
            parent.subordinates.splice(pathIndices[pathIndices.length - 1], 1);
            const empSub = [...(employee.subordinates).map(e => ({...e, parentId: employee.parentId}))].filter((emp) => emp.uniqueId);
            if (empSub.length) {
                parent.subordinates.push(empSub);
            }
        }
    }

    move(employeeId: number, supervisorId: number): void {
        const employeePath = this.findShortestPathEmp(this.ceo, employeeId);
        const supervisorPath = this.findShortestPathEmp(this.ceo, supervisorId);

        if (employeePath && supervisorPath) {
            this.removeEmployee(this.ceo, employeePath.path);
            const supervisor = supervisorPath.employee;
            const employee = employeePath.employee;
            
            const supervisorSub = supervisor.subordinates.filter(emp => emp.uniqueId)
            supervisorSub.push({ ...employee, subordinates: [] })
            supervisor.subordinates = [...supervisorSub];

            const prevParentEmployeePath = [...employeePath.path]
            prevParentEmployeePath.pop()

            const moveOperation: MoveOperation = {
                type: "move",
                employeeId,
                supervisorId,
                prevParentEmployeePath
            };
            this.moveOperations.push(moveOperation);
        }
    }

    redo(): void {
        if (this.redoOperations.length === 0) {
            console.log("Nothing to redo.");
            return;
        }

        const lastRedo = this.redoOperations.pop();
        const { employeeId, supervisorId } = lastRedo;
        this.move(employeeId, supervisorId)
    }

    undo(): void {
        if (this.moveOperations.length === 0) {
            console.log("Nothing to undo.");
            return;
        }
        const lastMove = this.moveOperations.pop();
        if (lastMove) {
            const { employeeId, prevParentEmployeePath } = lastMove;
            const employeePath = this.findShortestPathEmp(this.ceo, employeeId);
      
            if (employeePath) {
                this.removeEmployee(this.ceo, employeePath.path);

               const prevSupervisor = prevParentEmployeePath.reduce((root, index) => root.subordinates?.[index], this.ceo)
               prevSupervisor.subordinates.push({ ...employeePath.employee, subordinates: [] })
          
                this.redoOperations.push(lastMove);
            }
        }
    }
}

// const ceo = {
//     uniqueId: 1,
//     name: "Mark Zuckerberg",
//     subordinates: [
//         {
//             uniqueId: 2,
//             name: "Sarah Donald",
//             subordinates: [
//                 {
//                     uniqueId: 3,
//                     name: "Cassandra Reynolds",
//                     subordinates: [
//                         {
//                             uniqueId: 4,
//                             name: "Mary Blue",
//                             subordinates: [],
//                         },
//                         {
//                             uniqueId: 5,
//                             name: "Bob Saget",
//                             subordinates: [
//                                 {
//                                     uniqueId: 6,
//                                     name: "Tina Teff",
//                                     subordinates: [
//                                         {
//                                             uniqueId: 7,
//                                             name: "Will Turner",
//                                             subordinates: [],
//                                         },
//                                     ],
//                                 },
//                             ],
//                         },
//                     ],
//                 },
//             ],
//         },
//         {
//             uniqueId: 8,
//             name: "Tyler Simpson",
//             subordinates: [
//                 {
//                     uniqueId: 9,
//                     name: "Harry Tobs",
//                     subordinates: [
//                         {
//                             uniqueId: 10,
//                             name: "Thomas Brown",
//                             subordinates: [],
//                         },
//                     ],
//                 },
//                 {
//                     uniqueId: 11,
//                     name: "George Carrey",
//                     subordinates: [],
//                 },
//                 {
//                     uniqueId: 12,
//                     name: "Gary Styles",
//                     subordinates: [],
//                 },
//             ],
//         },
//         {
//             uniqueId: 13,
//             name: "Bruce Wilis",
//             subordinates: [],
//         },
//         {
//             uniqueId: 14,
//             name: "Georgina Flangy",
//             subordinates: [
//                 {
//                     uniqueId: 15,
//                     name: "Sophie Turner",
//                     subordinates: [],
//                 },
//             ],
//         },
//     ],
// };


const ceo = {
    uniqueId: 1,
    name: "Mark Zuckerberg",
    subordinates: [
        {
            uniqueId: 8,
            name: "Tyler Simpson",
            subordinates: [
                {
                    uniqueId: 9,
                    name: "Harry Tobs",
                    subordinates: [
                        {
                            uniqueId: 10,
                            name: "Thomas Brown",
                            subordinates: [],
                        },
                    ],
                },
                {
                    uniqueId: 11,
                    name: "George Carrey",
                    subordinates: [],
                },
                {
                    uniqueId: 12,
                    name: "Gary Styles",
                    subordinates: [],
                },
            ],
        },
    ],
};


const app = new EmployeeOrgApp(ceo);
app.move(11, 12);
app.undo();
app.redo();
console.dir(ceo,{depth: null});