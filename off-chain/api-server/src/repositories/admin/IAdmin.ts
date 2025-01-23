export interface IAdmin {
    adminId: string;
    email: string;
    password: string;
}

export interface IAdminRepo {
    // getAllAdmins(): Promise<IAdmin[]>;
    getAllAdmins(): Promise<any>;
    findByEmail(username: string): Promise<any>
}