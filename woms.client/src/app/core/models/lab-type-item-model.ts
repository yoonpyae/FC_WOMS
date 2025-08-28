export interface LabTypeItemModel {
    id: number;
    testId: number;
    type: 'labtest' | 'subgroup' | 'maingroup';
    labTestName: string;
    fee: number;
}
