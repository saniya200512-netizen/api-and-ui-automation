const { test, expect } = require('@playwright/test');

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

const newBooking = {
  firstname: 'Jane',
  lastname: 'Tester',
  totalprice: 150,
  depositpaid: true,
  bookingdates: { checkin: '2026-12-01', checkout: '2026-12-05' },
  additionalneeds: 'Breakfast',
};

// Tests share state (token, bookingId), so run them in order.
test.describe.configure({ mode: 'serial' });

test.describe('Restful-Booker API', () => {
  let token;
  let bookingId;

  test('1. health check returns 201', async ({ request }) => {
    const res = await request.get('/ping');
    expect(res.status()).toBe(201);
  });

  test('2. auth returns a token for valid credentials', async ({ request }) => {
    const res = await request.post('/auth', {
      headers: JSON_HEADERS,
      data: { username: 'admin', password: 'password123' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    token = body.token;
  });

  test('3. auth rejects bad credentials', async ({ request }) => {
    const res = await request.post('/auth', {
      headers: JSON_HEADERS,
      data: { username: 'admin', password: 'wrong' },
    });
    expect(res.status()).toBe(200);
    expect((await res.json()).reason).toBe('Bad credentials');
  });

  test('4. list bookings returns ids', async ({ request }) => {
    const res = await request.get('/booking', { headers: JSON_HEADERS });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]).toHaveProperty('bookingid');
  });

  test('5. create booking', async ({ request }) => {
    const res = await request.post('/booking', { headers: JSON_HEADERS, data: newBooking });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.bookingid).toBeTruthy();
    expect(body.booking).toMatchObject(newBooking);
    bookingId = body.bookingid;
  });

  test('6. read booking by id', async ({ request }) => {
    const res = await request.get(`/booking/${bookingId}`, { headers: JSON_HEADERS });
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject(newBooking);
  });

  test('7. update booking', async ({ request }) => {
    const updated = { ...newBooking, firstname: 'Janet', totalprice: 200 };
    const res = await request.put(`/booking/${bookingId}`, {
      headers: { ...JSON_HEADERS, Cookie: `token=${token}` },
      data: updated,
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.firstname).toBe('Janet');
    expect(body.totalprice).toBe(200);
  });

  test('8. delete booking', async ({ request }) => {
    const res = await request.delete(`/booking/${bookingId}`, {
      headers: { Cookie: `token=${token}` },
    });
    expect(res.status()).toBe(201);
  });

  test('9. deleted booking returns 404', async ({ request }) => {
    const res = await request.get(`/booking/${bookingId}`, { headers: JSON_HEADERS });
    expect(res.status()).toBe(404);
  });
});
