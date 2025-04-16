import React from 'react';
import ReactDOM from 'react-dom/client';
import SupportForm from "@/Pages/Ticket/Form";


const root = document.getElementById('support-widget');
if (root) {
    ReactDOM.createRoot(root).render(<SupportForm />);
}
