import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, amount } = body;

    if (!name || !email || !amount) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid data", status: 400 })
      );
    }

    let customer;
    const existingCustomer = await stripe.customers.list({ email });

    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0];
    } else {
      const newCustomer = await stripe.customers.create({ name, email });

      customer = newCustomer;
    }

    const ephemeralKey = await stripe.ephemeralKeys.create(
      {
        customer: customer.id,
      },
      {
        apiVersion: "2020-08-27",
      }
    );

    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: parseInt(amount) * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });

    return new Response(
      JSON.stringify({
        paymentIntent,
        ephemeralKey,
        customer: customer.id,
      })
    );
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
