interface Logger {
    type: "log" | "error";
    title: string;
    data: any;
}
