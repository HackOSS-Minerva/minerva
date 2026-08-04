import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
  Link,
} from "@react-email/components";
import type { TenantConfig } from "@/lib/tenant-config";

interface TemplateProps {
  children: React.ReactNode;
  name: string;
  preview: string;
  tenant: TenantConfig;
}

const Template = ({ children, name, preview, tenant }: TemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-4 max-w-116.25 rounded border border-solid border-[#eaeaea] p-5">
            <Section className="">
              <Img
                src={tenant.logo}
                width={194}
                height={79}
                alt={tenant.name}
                className="mx-auto my-0"
              />
            </Section>
            <Heading className="mx-0 my-2 p-0 text-center text-xl font-normal text-black">
              Thank you for applying!
            </Heading>
            <Text className="leading-6 text-black">
              Hello <strong>{name ?? "Insert Name"}</strong>,
            </Text>
            {children}
            <Text>
              - {tenant.name} Team {tenant.heart}
            </Text>
            <Hr className="mx-0 my-6.5 w-full border border-solid border-[#eaeaea]" />
            <Text>
              Visit{" "}
              <Link href={tenant.domain} className="text-blue-600">
                {tenant.domain.replace("https://www.", "")}
              </Link>{" "}
              for more information about {tenant.name} and follow us on{" "}
              <Link href={tenant.instagram} className="text-blue-600">
                Instagram
              </Link>{" "}
              and{" "}
              <Link href={tenant.linkedin} className="text-blue-600">
                LinkedIn
              </Link>{" "}
              for up to date information and announcements.
            </Text>
            <Text className="text-xs leading-6 text-[#666666]">
              This invitation was intended for{" "}
              <span className="text-black">{name ?? "Insert Name"}</span>. If
              you were not expecting this email, you can ignore this email. If
              you are concerned about your account&apos;s safety, please contact{" "}
              <Link href={`mailto:${tenant.email}`} className="text-blue-600">
                {tenant.email}
              </Link>{" "}
              to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default Template;
