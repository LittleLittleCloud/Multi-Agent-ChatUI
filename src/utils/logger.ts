class logger{
    public log(message: string){
        console.log(message);
    }
    public error(message: string){
        console.error(message);
    }
    public warn(message: string){
        console.warn(message);
    }
    public info(message: string){
        console.info(message);
    }
    public debug(message: string){
        console.debug(message);
    }
}

export const Logger = new logger();