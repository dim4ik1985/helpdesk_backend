const http = require("http");
const Koa = require("koa");
const cors = require("@koa/cors");
const { koaBody } = require("koa-body");
const moment = require("moment");

const app = new Koa();

app.use(
  koaBody({
    urlencoded: true,
    multipart: true,
  })
);

app.use(cors({
  origin(ctx) {
    return ctx.get('Origin') || '*';
  },
}));

class Ticket{
  constructor(id, name, status, created) {
    this.id = id // идентификатор (уникальный в пределах системы)
    this.name = name // краткое описание
    this.status = status // boolean - сделано или нет
    this.created = created // дата создания (timestamp)
  }
}
class TicketFull{
  constructor(id, name, description, status, created) {
    this.id = id // идентификатор (уникальный в пределах системы)
    this.name = name // краткое описание
    this.description = description // полное описание
    this.status = status // boolean - сделано или нет
    this.created = created // дата создания (timestamp)
  }
}

let ticketsFull = [];

let tickets = [];
ticketsFull.forEach(el => {
  tickets.push(new Ticket(el.id, el.name, el.status, el.created))
})

app.use(async (ctx) => {
  const { method, id, created } = ctx.request.query;
  const { name, description, status } = ctx.request.body;

  switch (method) {
    case "allTickets":
      ctx.response.body = tickets;
      return;
    // TODO: обработка остальных методов

    case "createTicket":
      const idTicket = Date.now();
      const defaultStatus = false;
      const created = moment().format('DD.MM.YY HH:mm');
      const ticket = new TicketFull(idTicket, name, description, defaultStatus, created);

      ticketsFull.push(ticket);
      tickets.push(new Ticket(ticket.id, ticket.name, ticket.status, ticket.created));

      ctx.response.body = tickets;
      return;

    case "ticketById":
      ctx.response.body = ticketsFull.find(item => item.id === +id);
      return;

    case "statusById":
      const searchItem = ticketsFull.find(item => item.id === +id);
      searchItem.status = status;
      tickets.find(item => item.id === +id).status = status;
      ctx.response.body = searchItem;
      return;

    case "deleteById":
      ticketsFull = ticketsFull.filter(item => item.id !== +id);
      tickets = tickets.filter(item => item.id !== +id);
      ctx.response.body = tickets;
      return;

    case "editTicket":
      const editTicketFull = ticketsFull.find(item => item.id === +id);
      const editTicket = tickets.find(item => item.id === +id);

      editTicketFull.name = name;
      editTicketFull.description = description;
      editTicketFull.created = moment().format('DD.MM.YY HH:mm');

      editTicket.name = name;
      editTicket.description = description;
      editTicket.created = moment().format('DD.MM.YY HH:mm');

      ctx.response.body = editTicket;
      return;

    default:
      ctx.response.status = 404;
      return;
  }
});

const server = http.createServer(app.callback());

const port = process.env.PORT || 7070;

server.listen(port, (err) => {
  if (err) {
    console.log(err);

    return;
  }

  console.log("Server is listening to " + port);
});
