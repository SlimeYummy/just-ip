export declare class IpV4 {
    private _b1;
    private _b2;
    private _b3;
    private _b4;
    private _int;
    static fromString(str: string): IpV4;
    static fromInt(int: number): IpV4;
    static fromIntBe(int: number): IpV4;
    static fromIntLe(int: number): IpV4;
    static fromBytes(b1: number, b2: number, b3: number, b4: number): IpV4;
    static fromArray(array: Array<number>): IpV4;
    toString(): string;
    toInt(): number;
    toIntBe(): number;
    toIntLe(): number;
    toArray(): Array<number>;
    static equal(ip1: IpV4, ip2: IpV4): boolean;
    equal(ip: IpV4): boolean;
    isUnspecified(): boolean;
    isLoopback(): boolean;
    isPrivate(): boolean;
    isLinkLocal(): boolean;
    isMulticast(): boolean;
    isBroadcast(): boolean;
    isDocumentation(): boolean;
    isGlobal(): boolean;
}
