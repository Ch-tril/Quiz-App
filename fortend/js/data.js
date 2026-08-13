// Quiz Application - Question Data

const quizData = [
  {
    id: 1,
    question: "Which HTML elements are used to define the structure of an HTML document?",
    options: ["<header>, <footer>, <main>", "<p>, <span>, <div>", "<script>, <style>", "<table>, <tr>, <td>"],
    answerIndex: 0
  },
  {
    id: 2,
    question: "Which language is primarily used for styling web applications?",
    options: ["Python", "JavaScript", "CSS", "SQL"],
    answerIndex: 2
  },
  {
    id: 3,
    question: "What does JSON stand for?",
    options: [
      "Java Standard Object Notation",
      "JavaScript Object Notation",
      "JavaScript Ordered Network",
      "Java Serialized Object Notation"
    ],
    answerIndex: 1
  },
  {
    id: 4,
    question: "Which HTTP method is typically used to create a new resource on a server?",
    options: ["GET", "PUT", "DELETE", "POST"],
    answerIndex: 3
  },
  {
    id: 5,
    question: "In JavaScript, which keyword declares a block-scoped variable that can be reassigned?",
    options: ["var", "let", "const", "static"],
    answerIndex: 1
  },
  {
    id: 6,
    question: "Which command initializes a new npm package interactively?",
    options: ["npm init", "npm start", "npm install", "npm run"],
    answerIndex: 0
  },
  {
    id: 7,
    question: "Which React hook is used to add state to a functional component?",
    options: ["useEffect", "useState", "useRef", "useContext"],
    answerIndex: 1
  },
  {
    id: 8,
    question: "What does DNS stand for?",
    options: ["Data Network System", "Domain Name System", "Digital Network Service", "Domain Network Server"],
    answerIndex: 1
  },
  {
    id: 9,
    question: "What is the primary function of DNS?",
    options: [
      "Encrypt web traffic",
      "Translate domain names to IP addresses",
      "Manage server firewalls",
      "Authenticate user identities"
    ],
    answerIndex: 1
  },
  {
    id: 10,
    question: "Which type of DNS server responds to recursive DNS queries from clients?",
    options: ["Root Nameserver", "TLD Nameserver", "Recursive Resolver", "Authoritative Nameserver"],
    answerIndex: 2
  },
  {
    id: 11,
    question: "What is the first step in a DNS resolution process?",
    options: [
      "Query the TLD Nameserver",
      "Query the Recursive Resolver",
      "Query the Root Nameserver",
      "Query the Authoritative Nameserver"
    ],
    answerIndex: 1
  },
  {
    id: 12,
    question: "How many Root Nameservers are currently operational worldwide?",
    options: ["3", "13", "25", "50"],
    answerIndex: 1
  },
  {
    id: 13,
    question: "What information does a Root Nameserver provide?",
    options: [
      "The IP address of the domain",
      "The location of TLD Nameservers",
      "Cached DNS records",
      "User authentication data"
    ],
    answerIndex: 1
  },
  {
    id: 14,
    question: "Which DNS record type maps a domain name to an IPv4 address?",
    options: ["AAAA", "A", "CNAME", "MX"],
    answerIndex: 1
  },
  {
    id: 15,
    question: "What does the 'A' record stand for in DNS?",
    options: ["Address", "Alias", "Authority", "Association"],
    answerIndex: 0
  },
  {
    id: 16,
    question: "Which DNS record type is used for email delivery?",
    options: ["A", "CNAME", "MX", "TXT"],
    answerIndex: 2
  },
  {
    id: 17,
    question: "What is a CNAME record used for?",
    options: [
      "Creating an alias for a domain name",
      "Defining mail server priority",
      "Mapping IPv6 addresses",
      "Adding text verification records"
    ],
    answerIndex: 0
  },
  {
    id: 18,
    question: "Which protocol does DNS primarily use for queries?",
    options: ["TCP only", "UDP only", "TCP and UDP", "HTTPS only"],
    answerIndex: 2
  },
  {
    id: 19,
    question: "What is DNS caching?",
    options: [
      "Deleting old DNS records",
      "Storing DNS query results temporarily to speed up future queries",
      "Encrypting DNS traffic",
      "Blocking access to certain domains"
    ],
    answerIndex: 1
  },
  {
    id: 20,
    question: "What is TTL in DNS records?",
    options: [
      "Time To Live - how long a record can be cached",
      "Transport Layer Transfer",
      "Total Transfer Load",
      "Trusted Third-party Link"
    ],
    answerIndex: 0
  }
];
