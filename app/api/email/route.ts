// import { Resend } from "resend";
// import { Accept } from "@/components/email";
// import { EmailType } from "@/types/email";

// const getPreview = (type: EmailType) => {
//   if (type === "CONFIRMATION") return "Thank you for Applying";
//   if (type === "ACCEPTANCE") return "You have been Accepted!";
//   if (type === "REJECTION") return "Application Update";
//   return "";
// };

// const getSubject = (type: EmailType) => {
//   if (type === "CONFIRMATION") return "[Confirmation]";
//   if (type === "ACCEPTANCE") return "[Acceptance]";
//   if (type === "REJECTION") return "[Rejection]";
//   return "";
// };

// export const POST = async (req: Request) => {
//   const { role, type, user } = await req.json();

//   const name = `${user.firstname} ${user.lastname}`;

//   const preview = getPreview(type);
//   const subject = getSubject(type);

//   try {
//     const resend = new Resend(process.env.RESEND_API_KEY);
//     const { data, error } = await resend.emails.send({
//       from: "Acme <onboarding@resend.dev>",
//       to: [user.email],
//       subject: subject,
//       text: "Hello World",
//       // react: EmailTemplate({ name, position: role, type, preview }),
//       react: Accept(),
//     });

//     console.log(
//       "[email-api] Resend response data:",
//       JSON.stringify(data, null, 2),
//     );
//     console.log(
//       "[email-api] Resend response error:",
//       JSON.stringify(error, null, 2),
//     );

//     if (error) {
//       return Response.json({ error }, { status: 500 });
//     }

//     return Response.json(data);
//   } catch (error) {
//     console.error("[email-api] Exception during send:", error);
//     return Response.json({ error }, { status: 500 });
//   }
// };

export const POST = () => {};
