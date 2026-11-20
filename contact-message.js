(function () {
  'use strict';
  const genericTopic = 'Masih ingin berdiskusi';
  let formControls;

  function oneLine(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function buildContactLinks({ topic = genericTopic, name = '', business = '', brief = '' } = {}) {
    name = oneLine(name);
    business = oneLine(business);
    topic = oneLine(topic) || genericTopic;
    brief = String(brief || '').trim();
    const discussion = topic === genericTopic ? 'kebutuhan website, aplikasi, atau otomasi' : topic;
    const introduction = name
      ? `Perkenalkan, saya ${name}${business ? ` dari ${business}` : ''}.`
      : business ? `Saya ingin berdiskusi untuk kebutuhan ${business}.` : 'Saya ingin mendiskusikan kebutuhan digital untuk bisnis saya.';
    const content = [
      introduction,
      `Topik konsultasi: ${discussion}.`,
      brief ? `Ringkasan kebutuhan:\n${brief}` : 'Saya ingin menjelaskan kebutuhan dan kendala yang ingin dipermudah terlebih dahulu.',
      'Apakah kita bisa berdiskusi mengenai solusi yang sesuai dan langkah selanjutnya?',
      name ? `Terima kasih,\n${name}` : 'Terima kasih.',
    ].join('\n\n');
    const subject = `Konsultasi ${topic === genericTopic ? 'Kebutuhan Digital' : topic}${business ? ` — ${business}` : ''}`;
    const whatsappText = `Halo Yeario,\n\n${content}`;
    const emailText = `Yth. Yeario Endriano,\n\n${content}`;
    return {
      subject,
      whatsappText,
      emailText,
      whatsapp: `https://wa.me/6285947502209?text=${encodeURIComponent(whatsappText)}`,
      email: `mailto:yearioendriano01@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailText)}`,
    };
  }

  function update() {
    if (!formControls) return;
    const { topic, name, business, brief, whatsapp, email, draft, emailLinks } = formControls;
    const links = buildContactLinks({ topic: topic.value, name: name.value, business: business.value, brief: brief.value });
    whatsapp.href = links.whatsapp;
    email.href = links.email;
    draft.textContent = links.whatsappText;
    emailLinks.forEach(link => { link.href = links.email; });
  }

  function selectTopic(value) {
    if (!formControls) return;
    if (Array.from(formControls.topic.options).some(option => option.value === value)) {
      formControls.topic.value = value;
      update();
    }
  }

  function init(doc) {
    doc.querySelectorAll('a[data-contact-link]').forEach(link => {
      const links = buildContactLinks({ topic: link.dataset.contactTopic });
      link.href = links[link.dataset.contactLink];
    });
    const form = doc.getElementById('brief-form');
    if (!form) return;
    formControls = {
      topic: doc.getElementById('project-type'),
      name: doc.getElementById('contact-name'),
      business: doc.getElementById('contact-business'),
      brief: doc.getElementById('brief'),
      whatsapp: doc.getElementById('whatsapp-send'),
      email: doc.getElementById('email-send'),
      draft: doc.getElementById('contact-draft'),
      emailLinks: doc.querySelectorAll('a[data-contact-form-email]'),
    };
    form.addEventListener('submit', event => event.preventDefault());
    formControls.topic.addEventListener('change', update);
    [formControls.name, formControls.business, formControls.brief].forEach(input => input.addEventListener('input', update));
    update();
  }

  const api = { buildContactLinks, init, selectTopic };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') {
    window.YearioContact = api;
    init(window.document);
  }
})();
