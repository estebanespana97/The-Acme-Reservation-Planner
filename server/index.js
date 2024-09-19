const { client,createTables,createCustomer, createRestaurant, fetchCustomers, fetchRestaurants, createReservations, fetchReservations, destroyReservation} = require('./db');

const express = require('express');
const app = express();
app.use(express.json());

//routes: 
app.get('/api/customers', async(req, res, next)=> {
    try {
      res.send(await fetchCustomers());
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.get('/api/restaurants', async(req, res, next)=> {
    try {
      res.send(await fetchRestaurants());
    }
    catch(ex){
      next(ex);
    }
  });
  
  app.get('/api/reservations', async(req, res, next)=> {
    try {
      res.send(await fetchReservations());
    }
    catch(ex){
      next(ex);
    }
  });  

  app.delete('/api/customers/:customer_id/reservations/:id',  async(req, res, next)=> {
    try {
        await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});
        res.sendStatus(204);
    }
    catch(ex){
        next(ex);
    }
});

app.post('/api/customers/:id/reservations',  async(req, res, next)=> {
    try {
        res.status(201).send(await createReservations({ customer_id: req.params.id, restaurant_id: req.body.restaurant_id, date: req.body.date, party_count: req.body.party_count}));
    }
    catch(ex){
        next(ex);
    }
});

const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('created tables');
    const [moe, lucy, larry, ethyl, buca, subway, wingstop] = await Promise.all([
      createCustomer({ name: 'moe'}),
      createCustomer({ name: 'lucy'}),
      createCustomer({ name: 'larry'}),
      createCustomer({ name: 'ethyl'}),
      createRestaurant({ name: 'buca'}),
      createRestaurant({ name: 'subway'}),
      createRestaurant({ name: 'wingstop'}),
    ]);
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());
    
    const [reservation, reservation2] = await Promise.all([
      createReservations({
        customer_id: moe.id,
        restaurant_id: buca.id,
        date: '02/14/2024',
        party_count : 2
        }),
        createReservations({
          customer_id: moe.id,
            restaurant_id: wingstop.id,
            date: '02/28/2024',
            party_count : 4
        }),
    ]);
    console.log(await fetchReservations());
    await destroyReservation({ id: reservation.id, customer_id: reservation.customer_id});
    console.log(await fetchReservations());

    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
        console.log('some curl commands to test');
        console.log(`curl localhost:${port}/api/customers`);
        console.log(`curl localhost:${port}/api/restaurants`);
       console.log(`curl localhost:${port}/api/reservations`);
       console.log(`curl -X DELETE localhost:${port}/api/customers/${moe.id}/reservations/${reservation2.id}`);
       console.log(`curl -X POST localhost:${port}/api/customers/${moe.id}/reservations/ -d '{"restaurant_id":"${subway.id}", "date": "02/15/2025"}' -H "Content-Type:application/json"`);
     });
};


init();