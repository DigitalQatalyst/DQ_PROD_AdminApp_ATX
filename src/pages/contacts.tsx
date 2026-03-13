import { AppLayout } from '../components/AppLayout';
import ContactsModule from '../modules/contacts';

const ContactsPage = () => {
  return (
    <AppLayout activeSection="contacts">
      <ContactsModule />
    </AppLayout>
  );
};

export default ContactsPage;
