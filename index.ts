interface Employee {
    uniqueId: number;
    name: string;
    subordinates: Employee[];
    parentId?: number[];
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

    /**
     * The function `findShortestPathEmp` recursively searches for an employee with a given ID in a
     * tree structure and returns the shortest path to that employee.
     * @param {Employee} root - The root parameter is an object of type Employee, which represents the
     * root employee in a hierarchical structure.
     * @param {number} empId - The `empId` parameter is the unique identifier of the employee we are
     * searching for in the employee hierarchy.
     * @param {number[]} path - The `path` parameter is an array that keeps track of the indices of the
     * subordinates that have been traversed so far in the search for the employee with the given
     * `empId`. It is initialized as an empty array `[]` and is updated recursively as the function
     * traverses through the sub
     * @returns The function `findShortestPathEmp` returns an object with two properties: `path` and
     * `employee`. The `path` property is an array of numbers representing the path to the employee
     * with the specified `empId`. The `employee` property is the Employee object with the specified
     * `empId`. If no employee with the specified `empId` is found, the function returns `null
     */
    findShortestPathEmp(
        root: Employee,
        empId: number,
        path: number[] = [],
    ): { path: number[]; employee: Employee } | null {
        if (root?.uniqueId === empId) {
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
            );
            if (found) {
                return found;
            }
        }
        return null;
    }

    /**
     * The function removes an employee from a hierarchical employee structure based on a given path of
     * indices.
     * @param {Employee} root - The `root` parameter is the root employee object, which represents the
     * top-level employee in the hierarchy. It contains information about the employee and an array of
     * subordinates.
     * @param {number[]} pathIndices - The `pathIndices` parameter is an array of numbers that
     * represents the path to the employee that needs to be removed. Each number in the array
     * represents the index of the subordinate in the `subordinates` array of the parent employee.
     */
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
            //remove employee and pop out all subordinates and update parentId list of each subordinate
            parent.subordinates.splice(pathIndices[pathIndices.length - 1], 1);
            const empSub = [...(employee.subordinates).map(e => ({ ...e, parentId: [...(e.parentId || []), employee.uniqueId] }))].filter((emp) => emp.uniqueId);
            if (empSub.length) {
                parent.subordinates.push(...empSub);
            }
        }
    }

    /**
     * The `move` function moves an employee to a new supervisor, updating the employee's hierarchy and
     * keeping track of the move operation.
     * @param {number} employeeId - The employeeId parameter is the unique identifier of the employee
     * who needs to be moved.
     * @param {number} supervisorId - The supervisorId parameter is the unique identifier of the
     * supervisor to whom the employee will be moved.
     */
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

    /**
     * The `redo` function allows the user to redo the last operation by moving an employee to a
     * different supervisor.
     * @returns The `redo()` function does not return anything. It has a return type of `void`, which
     * means it does not return a value.
     */
    redo(): void {
        if (this.redoOperations.length === 0) {
            console.log("Nothing to redo.");
            return;
        }

        const lastRedo = this.redoOperations.pop();
        const { employeeId, supervisorId } = lastRedo;
        this.move(employeeId, supervisorId)
        console.dir(this.ceo, {depth: null})
    }

    /**
     * The `undo` function removes the most recent move operation and restores the employee to their
     * previous position in the organizational hierarchy.
     * @returns The `undo()` function does not have a return type specified, so it is returning `void`,
     * which means it does not return any value.
     */
    undo(): void {
        if (this.moveOperations.length === 0) {
            console.log("Nothing to undo.");
            return;
        }
        const lastIndex = this.moveOperations.length - 1
        const lastMove = this.moveOperations.pop();
        if (lastMove) {
            const { employeeId, prevParentEmployeePath } = lastMove;
            const employeePath = this.findShortestPathEmp(this.ceo, employeeId);
            const employee = employeePath.employee
            if (employeePath) {
                this.removeEmployee(this.ceo, employeePath.path);

                const prevSupervisor = prevParentEmployeePath.reduce((root, index) => root.subordinates?.[index], this.ceo)

                //check if current subordinates are belongs to previous employee
                const listSubIdOfEmployee = []
                const checkSubordinates = prevSupervisor.subordinates.filter(e => {
                    if (e.parentId && e.parentId[lastIndex] === employee.uniqueId) {
                        listSubIdOfEmployee.push(e.uniqueId)
                        return e
                    }
                })

                let subordinatesOfEmployee = []
                if (listSubIdOfEmployee?.length) {
                    subordinatesOfEmployee = [...checkSubordinates].map(e => {
                        const parentId = [...e.parentId]
                        parentId.pop();
                        return {
                            ...e,
                            parentId
                        }
                    })

                    prevSupervisor.subordinates = prevSupervisor.subordinates.filter(e => !listSubIdOfEmployee.includes(e.uniqueId))
                }

                //push employee to prevSupervisor
                prevSupervisor.subordinates.push({ ...employee, subordinates: subordinatesOfEmployee })
                
                this.redoOperations.push(lastMove);
            }
        }
    }
}

const ceo = {
    uniqueId: 1,
    name: "Mark Zuckerberg",
    subordinates: [
        {
            uniqueId: 2,
            name: "Sarah Donald",
            subordinates: [
                {
                    uniqueId: 3,
                    name: "Cassandra Reynolds",
                    subordinates: [
                        {
                            uniqueId: 4,
                            name: "Mary Blue",
                            subordinates: [],
                        },
                        {
                            uniqueId: 5,
                            name: "Bob Saget",
                            subordinates: [
                                {
                                    uniqueId: 6,
                                    name: "Tina Teff",
                                    subordinates: [
                                        {
                                            uniqueId: 7,
                                            name: "Will Turner",
                                            subordinates: [],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
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
        {
            uniqueId: 13,
            name: "Bruce Wilis",
            subordinates: [],
        },
        {
            uniqueId: 14,
            name: "Georgina Flangy",
            subordinates: [
                {
                    uniqueId: 15,
                    name: "Sophie Turner",
                    subordinates: [],
                },
            ],
        },
    ],
};


const app = new EmployeeOrgApp(ceo);
app.move(9, 12);
app.move(10,12);
app.undo();
app.undo();
app.redo();