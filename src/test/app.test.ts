import { EmployeeOrgApp, Employee } from '../index';

describe('EmployeeOrgApp', () => {
    let ceo: Employee;
    let app: EmployeeOrgApp;

    beforeEach(() => {
        // Set up the initial state before each test
        ceo = {
            uniqueId: 1,
            name: 'Mark Zuckerberg',
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
                }
            ],
        };
        app = new EmployeeOrgApp(ceo);
    });

    test('move should move employee to new supervisor', () => {
        app.move(9, 12);
        const expectedResult = {
            uniqueId: 1,
            name: 'Mark Zuckerberg',
            subordinates: [
                {
                    uniqueId: 8,
                    name: "Tyler Simpson",
                    subordinates: [
                        {
                            uniqueId: 11,
                            name: "George Carrey",
                            subordinates: [],
                        },
                        {
                            uniqueId: 12,
                            name: "Gary Styles",
                            subordinates: [
                                {
                                    uniqueId: 9,
                                    name: "Harry Tobs",
                                    subordinates: []
                                }
                            ],
                        },
                        {
                            uniqueId: 10,
                            name: "Thomas Brown",
                            subordinates: [],
                            parentId: [9],
                        },
                    ],
                }
            ],
        }
        // Make sure the state has changed after moving
        expect(ceo).toEqual(JSON.parse(JSON.stringify(expectedResult))); 
    });

    test('undo should revert the last move operation including move its subordinate', () => {
        app.move(9, 12); // Call the move function to perform a move operation
        app.undo(); // Call the undo function to revert the last move operation

        //because the order is not saved so I will create expected result for it (just changes order of subordinates)
        const expectedResult = {
            uniqueId: 1,
            name: 'Mark Zuckerberg',
            subordinates: [
                {
                    uniqueId: 8,
                    name: "Tyler Simpson",
                    subordinates: [
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
                        {
                            uniqueId: 9,
                            name: "Harry Tobs",
                            subordinates: [
                                //uniqueId: 10 becomes subordinates of uniqueId: 9 as before moving and remove 
                                {
                                    uniqueId: 10,
                                    name: "Thomas Brown",
                                    subordinates: [],
                                    parentId: [],
                                }
                            ]
                        }
                    ],
                }
            ],
        }

        expect(ceo).toEqual(expectedResult);
    });

    test('redo should reapply the last undone move operation', () => {
        app.move(9, 12);
        app.undo(); // Call the undo function to revert the last move operation
        app.redo(); // Call the redo function to reapply the undone move operation

        //because the order is not saved so I will create expected result for it (just changes order of subordinates)
        const expectedResult = {
            uniqueId: 1,
            name: 'Mark Zuckerberg',
            subordinates: [
                {
                    uniqueId: 8,
                    name: "Tyler Simpson",
                    subordinates: [
                        {
                            uniqueId: 11,
                            name: "George Carrey",
                            subordinates: [],
                        },
                        {
                            uniqueId: 12,
                            name: "Gary Styles",
                            subordinates: [
                                {
                                    uniqueId: 9,
                                    name: "Harry Tobs",
                                    subordinates: []
                                }
                            ],
                        },
                        {
                            uniqueId: 10,
                            name: "Thomas Brown",
                            subordinates: [],
                            parentId: [9],
                        },
                    ],
                }
            ],
        }

        expect(ceo).toEqual(expectedResult); // Make sure the state is back to the state after moving
    });
});