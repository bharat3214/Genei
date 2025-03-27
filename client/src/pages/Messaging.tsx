import { Helmet } from "react-helmet";
import MessagingContainer from "@/components/messaging/MessagingContainer";

export default function MessagingPage() {
  return (
    <>
      <Helmet>
        <title>Messaging | Drug Discovery Assistant</title>
      </Helmet>
      <div className="container mx-auto py-6 h-full">
        <MessagingContainer />
      </div>
    </>
  );
}