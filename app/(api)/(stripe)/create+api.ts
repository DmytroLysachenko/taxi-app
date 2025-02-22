import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, amount } = body;
    console.log("extracted values from body", { name, email, amount });
    if (!name || !email || !amount) {
      return new Response(
        JSON.stringify({ error: "Please enter a valid data", status: 400 })
      );
    }

    let customer;
    const existingCustomer = await stripe.customers.list({ email });

    console.log("check customer", existingCustomer);

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

    console.log("ephemeralKey created", ephemeralKey);
    console.log("amount", amount, parseInt(amount) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customer.id,
      amount: parseInt(amount) * 100,
      currency: "usd",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
    });
    console.log("✅ Successfully reached after await paymentIntent");
    console.log("paymentIntent created", paymentIntent);

    return Response.json(
      {
        paymentIntent,
        ephemeralKey,
        customer: customer.id,
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.log(error);
    return Response.json({ error }, { status: 500 });
  }
}
