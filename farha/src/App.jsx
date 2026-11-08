import React from "react";
import { StoreProvider, ToastProvider, useRoute } from "./store";
import { TopBar } from "./components/ui";
import Welcome from "./pages/Welcome";
import { Explore, VenueDetail } from "./pages/Market";
import Client, { GuestInvite } from "./pages/Client";
import Vendor from "./pages/Vendor";
import Study from "./pages/Study";

function Router() {
  const route = useRoute();
  if (route.startsWith("invite-")) return <GuestInvite code={route.slice(7)} />;
  let page;
  if (route === "explore") page = <Explore />;
  else if (route.startsWith("venue-")) page = <VenueDetail key={route} id={route.slice(6)} />;
  else if (route === "my") page = <Client />;
  else if (route === "vendor") page = <Vendor />;
  else if (route === "study") page = <Study />;
  else page = <Welcome />;
  return (<><TopBar route={route} />{page}</>);
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </StoreProvider>
  );
}
