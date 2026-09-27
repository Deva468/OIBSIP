import {
  useMemo,
  useState,
} from "react";

const Help = () => {
  const [search, setSearch] =
    useState("");

  const [openIndex, setOpenIndex] =
    useState(null);

  const faqs = [
    {
      category: "Orders",
      question:
        "How do I place an order?",
      answer:
        "Choose a pizza, customize it if needed, add it to the cart and continue to checkout.",
    },
    {
      category: "Orders",
      question:
        "How do I track my order?",
      answer:
        "Open My Orders and choose the order you want to track. The order tracking page will show its current status.",
    },
    {
      category: "Pizza",
      question:
        "Can I customize my pizza?",
      answer:
        "Yes. Use Customize from a pizza card and choose your base, sauce, cheese and vegetables.",
    },
    {
      category: "Payment",
      question:
        "Which payment methods are available?",
      answer:
        "The checkout flow supports Cash on Delivery and online payment through Razorpay once the payment integration is enabled.",
    },
    {
      category: "Delivery",
      question:
        "When is delivery free?",
      answer:
        "The current offer provides free delivery for eligible orders above ₹500.",
    },
    {
      category: "Account",
      question:
        "How do I change my password?",
      answer:
        "Open Profile or Settings, go to Account & Security and use Change Password.",
    },
    {
      category: "Account",
      question:
        "Can I save multiple delivery addresses?",
      answer:
        "Yes. Profile > Saved Addresses lets you add, edit and remove delivery addresses.",
    },
    {
      category: "Offers",
      question:
        "How do offers work?",
      answer:
        "Open Offers and select a promotion to view the pizzas associated with that offer.",
    },
  ];

  const filteredFaqs =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return faqs;
      }

      return faqs.filter(
        (faq) =>
          faq.question
            .toLowerCase()
            .includes(value) ||
          faq.answer
            .toLowerCase()
            .includes(value) ||
          faq.category
            .toLowerCase()
            .includes(value)
      );
    }, [search]);

  return (
    <div className="help-page">
      <div className="help-header">
        <span>
          SUPPORT CENTER
        </span>

        <h1>
          How can we help? 💬
        </h1>

        <p>
          Search a topic or open a question
          to view the answer.
        </p>

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Search help..."
        />
      </div>

      <div className="faq-list">
        {filteredFaqs.map(
          (faq, index) => {
            const isOpen =
              openIndex ===
              index;

            return (
              <div
                className="faq-item"
                key={faq.question}
              >
                <button
                  type="button"
                  className="faq-question"
                  onClick={() =>
                    setOpenIndex(
                      isOpen
                        ? null
                        : index
                    )
                  }
                >
                  <div>
                    <span className="faq-category">
                      {faq.category}
                    </span>

                    <strong>
                      {faq.question}
                    </strong>
                  </div>

                  <span className="faq-icon">
                    {isOpen
                      ? "−"
                      : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      {filteredFaqs.length ===
        0 && (
        <div className="empty-message">
          No help topics found.
        </div>
      )}

      <div className="help-contact-card">
        <div>
          <span>
            STILL NEED HELP?
          </span>

          <h2>
            Talk to our support team
          </h2>

          <p>
            support@pizzadelivery.com
          </p>
        </div>

        <a
          href="mailto:support@pizzadelivery.com"
          className="primary-button"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default Help;