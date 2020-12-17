const { createLogger, format, transports } = require("winston");

// console.log
// console.info
// console.warn
// console.error

const logger = createLogger({
  level: "info", // log는 기록이 안 되고 나머지는 다 기록됨
  format: format.json(),
  transports: [
    new transports.File({ filename: "combined.log" }),
    new transports.File({ filename: "error.log", level: "error" }), // 에러만 기록
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console({ format: format.simple() })); // 개발중일 때는 그냥 콘솔에 표시
}

module.exports = logger;
