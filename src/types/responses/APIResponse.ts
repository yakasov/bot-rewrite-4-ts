export namespace APITypes {
  export interface Response {
    data: Rules;
  }

  export interface Rules {
    [key: string]: string;
  }
}
