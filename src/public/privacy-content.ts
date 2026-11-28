import type { PublicLanguage } from './content.ts'

export const privacyCopy = {
  en: {
    heading: 'Siravuno privacy and data',
    description:
      'How Siravuno stores CVs in your browser, handles backups and deletion, and uses Google Analytics in the builder.',
    navigation: 'Privacy page language',
    contents: 'On this page',
    sections: [
      {
        id: 'local-data',
        heading: 'Your CV and browser storage',
        paragraphs: [
          'The builder saves one current CV and a language preference in this browser profile for this site. CV content, portraits, and appearance settings are processed on your device; Siravuno has no CV-upload backend or account-based cloud sync. Fonts are bundled locally.',
          'Browser storage is not encrypted or a permanent backup. Other people or software with access to your browser profile may access it. Clearing site data or ending private browsing can remove your draft. If saving fails, keep the editor open and download a JSON backup before reloading.',
        ],
      },
      {
        id: 'files',
        heading: 'Backups, exports, and deletion',
        paragraphs: [
          'JSON backups include your CV, portrait when present, document language, and appearance. PDFs contain the CV you export. You control where these files are stored and whom you share them with. Restoring a backup reads the selected file on your device and requires confirmation before replacing the current CV.',
          'Start over replaces the current CV after confirmation but keeps your language preference. To remove the site’s stored draft and preference, clear this site’s data in your browser settings. This does not delete downloaded JSON or PDF files, copies you shared, or analytics data already received by Google. Manage downloaded and shared copies separately.',
        ],
      },
      {
        id: 'analytics',
        heading: 'Google Analytics in the builder',
        paragraphs: [
          'The production builder loads Google Analytics immediately when a valid measurement ID is configured. There is no opt-in prompt. Google can use cookies or similar identifiers and receives technical request, session, and engagement information. This is not anonymous or zero-data collection.',
          'The application supplies the site origin and page path without query strings or fragments, a fixed Siravuno page title, and an empty referrer. It disables Google Signals and advertising personalization signals. It does not deliberately send CV fields, portraits, backups, user IDs, or custom editor events to analytics.',
          'Google’s tag is third-party code running in the builder page. These application settings are not a guarantee that third-party code cannot inspect the page. Collection also depends on the Google property configuration; the maintainer must keep enhanced measurement and additional tags disabled. Public overview, template, help, and privacy pages contain no analytics or client scripts and do not read your draft.',
        ],
      },
      {
        id: 'requests',
        heading: 'Site requests and your choices',
        paragraphs: [
          'Your browser requests pages and local assets from the hosting provider. Those requests expose technical information such as your IP address and browser headers to the provider. When analytics loads, your browser also contacts Google. Blocking analytics does not prevent the local CV editing and export features from working.',
          'Browser privacy settings and content blockers may restrict analytics requests or cookies. Clearing site data removes the local CV too, so make a backup first. There is no in-app analytics opt-out or account-based deletion request tool.',
        ],
      },
      {
        id: 'scope',
        heading: 'Scope of this disclosure',
        paragraphs: [
          'Technical disclosure updated November 28, 2026. It describes the application implementation, not a verification of live hosting logs, Google property settings, or retention periods. Operator identity, a privacy contact, and provider-specific retention details still need to be supplied by the site owner. This page does not establish legal compliance.',
        ],
      },
    ],
  },
  fr: {
    heading: 'Confidentialité et données dans Siravuno',
    description:
      'Comment Siravuno conserve les CV dans le navigateur, gère les sauvegardes et la suppression, et utilise Google Analytics dans le créateur.',
    navigation: 'Langue de la page de confidentialité',
    contents: 'Sur cette page',
    sections: [
      {
        id: 'local-data',
        heading: 'Votre CV et le stockage du navigateur',
        paragraphs: [
          'Le créateur conserve un CV courant et une préférence de langue dans ce profil de navigateur pour ce site. Le contenu, les portraits et l’apparence sont traités sur votre appareil. Siravuno n’a ni serveur de dépôt de CV ni synchronisation par compte. Les polices sont fournies localement.',
          'Le stockage du navigateur n’est ni chiffré ni une sauvegarde permanente. Les personnes ou logiciels ayant accès à votre profil peuvent y accéder. Effacer les données du site ou terminer une session privée peut supprimer le brouillon. Si l’enregistrement échoue, gardez le créateur ouvert et téléchargez une sauvegarde JSON avant de recharger.',
        ],
      },
      {
        id: 'files',
        heading: 'Sauvegardes, exports et suppression',
        paragraphs: [
          'Les sauvegardes JSON incluent le CV, le portrait éventuel, la langue et l’apparence. Les PDF contiennent le CV exporté. Vous choisissez où conserver ces fichiers et avec qui les partager. La restauration lit le fichier choisi sur votre appareil et exige une confirmation avant de remplacer le CV actuel.',
          'Recommencer remplace le CV après confirmation mais conserve la langue. Pour supprimer le brouillon et la préférence enregistrés, effacez les données de ce site dans les réglages du navigateur. Cela ne supprime ni les fichiers JSON ou PDF téléchargés, ni les copies partagées, ni les données analytiques déjà reçues par Google. Gérez ces copies séparément.',
        ],
      },
      {
        id: 'analytics',
        heading: 'Google Analytics dans le créateur',
        paragraphs: [
          'Le créateur en production charge immédiatement Google Analytics lorsqu’un identifiant de mesure valide est configuré. Aucun consentement préalable n’est demandé dans l’application. Google peut utiliser des cookies ou identifiants similaires et reçoit des informations techniques, de session et d’engagement. Il ne s’agit pas d’une collecte anonyme ou inexistante.',
          'L’application fournit l’origine et le chemin de la page sans paramètres ni fragment, un titre fixe Siravuno et un référent vide. Elle désactive les signaux Google et les signaux de personnalisation publicitaire. Elle n’envoie pas volontairement les champs du CV, portraits, sauvegardes, identifiants utilisateur ou événements personnalisés de l’éditeur.',
          'La balise Google est un code tiers exécuté dans la page du créateur. Ces réglages ne garantissent pas qu’un code tiers ne puisse pas examiner la page. La collecte dépend aussi de la propriété Google : le responsable doit désactiver les mesures améliorées et les balises supplémentaires. Les pages publiques de présentation, modèles, aide et confidentialité ne contiennent ni scripts clients ni analyse d’audience et ne lisent pas votre brouillon.',
        ],
      },
      {
        id: 'requests',
        heading: 'Requêtes du site et vos choix',
        paragraphs: [
          'Votre navigateur demande les pages et ressources locales à l’hébergeur. Ces requêtes lui exposent des informations techniques telles que l’adresse IP et les en-têtes du navigateur. Lorsque l’analyse est chargée, le navigateur contacte aussi Google. Bloquer l’analyse n’empêche pas la modification locale du CV ni son export.',
          'Les réglages de confidentialité et les bloqueurs peuvent limiter les requêtes ou cookies analytiques. Effacer les données du site supprime aussi le CV local : sauvegardez-le d’abord. Il n’existe ni désactivation de l’analyse dans l’application ni outil de demande de suppression lié à un compte.',
        ],
      },
      {
        id: 'scope',
        heading: 'Portée de cette information',
        paragraphs: [
          'Information technique mise à jour le 28 novembre 2026. Elle décrit le code de l’application, sans vérifier les journaux de l’hébergeur, les réglages Google ou les durées de conservation. Le propriétaire doit encore fournir l’identité de l’exploitant, un contact et les durées de conservation des prestataires. Cette page ne démontre pas une conformité juridique.',
        ],
      },
    ],
  },
  ar: {
    heading: 'الخصوصية والبيانات في Siravuno',
    description:
      'كيف يحفظ Siravuno السير الذاتية في المتصفح ويتعامل مع النسخ الاحتياطية والحذف ويستخدم Google Analytics في المنشئ.',
    navigation: 'لغة صفحة الخصوصية',
    contents: 'في هذه الصفحة',
    sections: [
      {
        id: 'local-data',
        heading: 'سيرتك الذاتية وتخزين المتصفح',
        paragraphs: [
          'يحفظ المنشئ سيرة حالية واحدة وتفضيل اللغة في ملف هذا المتصفح لهذا الموقع. تُعالج محتويات السيرة والصور وإعدادات المظهر على جهازك. لا يملك Siravuno خادمًا لرفع السير أو مزامنة سحابية عبر حساب. الخطوط مرفقة محليًا.',
          'تخزين المتصفح غير مشفّر وليس نسخة احتياطية دائمة. قد يتمكن الأشخاص أو البرامج التي تصل إلى ملف متصفحك من الوصول إليه. قد يؤدي مسح بيانات الموقع أو إنهاء التصفح الخاص إلى فقدان المسودة. إذا فشل الحفظ، أبقِ المنشئ مفتوحًا ونزّل نسخة JSON قبل إعادة التحميل.',
        ],
      },
      {
        id: 'files',
        heading: 'النسخ الاحتياطية والتصدير والحذف',
        paragraphs: [
          'تتضمن نسخ JSON السيرة والصورة إن وُجدت واللغة والمظهر. تتضمن ملفات PDF السيرة التي تصدّرها. أنت تختار مكان حفظ الملفات ومن تشاركها معه. تقرأ الاستعادة الملف المحدد على جهازك وتتطلب تأكيدًا قبل استبدال السيرة الحالية.',
          'يستبدل البدء من جديد السيرة بعد التأكيد لكنه يحتفظ باللغة. لحذف المسودة وتفضيل اللغة المحفوظين، امسح بيانات هذا الموقع من إعدادات المتصفح. لا يحذف ذلك ملفات JSON أو PDF المنزّلة أو النسخ المشتركة أو بيانات التحليلات التي تلقتها Google سابقًا. أدر تلك النسخ بشكل منفصل.',
        ],
      },
      {
        id: 'analytics',
        heading: 'Google Analytics في المنشئ',
        paragraphs: [
          'يحمّل منشئ الإنتاج Google Analytics فورًا عند إعداد معرّف قياس صالح، دون طلب موافقة مسبقة داخل التطبيق. قد تستخدم Google ملفات تعريف الارتباط أو معرّفات مشابهة وتتلقى معلومات تقنية ومعلومات الجلسات والتفاعل. هذا ليس جمعًا مجهولًا أو معدومًا للبيانات.',
          'يرسل التطبيق أصل الموقع ومسار الصفحة دون معاملات الاستعلام أو الجزء اللاحق لعلامة التجزئة، وعنوان Siravuno ثابتًا ومرجع إحالة فارغًا. يعطّل إشارات Google وإشارات تخصيص الإعلانات. لا يرسل عمدًا حقول السيرة أو الصور أو النسخ الاحتياطية أو معرّفات المستخدم أو أحداث المحرر المخصصة إلى التحليلات.',
          'وسم Google شيفرة خارجية تعمل داخل صفحة المنشئ. هذه الإعدادات لا تضمن عدم قدرة شيفرة خارجية على فحص الصفحة. يعتمد الجمع أيضًا على إعدادات خاصية Google؛ يجب على المسؤول تعطيل القياس المحسّن والوسوم الإضافية. صفحات التعريف والقوالب والمساعدة والخصوصية العامة لا تتضمن تحليلات أو نصوصًا برمجية للعميل ولا تقرأ مسودتك.',
        ],
      },
      {
        id: 'requests',
        heading: 'طلبات الموقع وخياراتك',
        paragraphs: [
          'يطلب متصفحك الصفحات والموارد المحلية من مزود الاستضافة، فتظهر له معلومات تقنية مثل عنوان IP وترويسات المتصفح. عند تحميل التحليلات يتصل المتصفح أيضًا بـ Google. لا يمنع حظر التحليلات تحرير السيرة محليًا أو تصديرها.',
          'قد تقيّد إعدادات الخصوصية وأدوات الحظر طلبات التحليلات أو ملفات تعريف الارتباط. يمسح حذف بيانات الموقع السيرة المحلية أيضًا، لذا احتفظ بنسخة أولًا. لا يوجد خيار لتعطيل التحليلات داخل التطبيق أو أداة لطلب حذف بيانات حساب.',
        ],
      },
      {
        id: 'scope',
        heading: 'نطاق هذا الإفصاح',
        paragraphs: [
          'آخر تحديث للإفصاح التقني: 28 نوفمبر 2026. يصف تنفيذ التطبيق ولا يتحقق من سجلات الاستضافة الفعلية أو إعدادات Google أو مدد الاحتفاظ. ما زال على مالك الموقع توفير هوية المشغّل ووسيلة اتصال للخصوصية ومدد احتفاظ مزودي الخدمة. لا تثبت هذه الصفحة الامتثال القانوني.',
        ],
      },
    ],
  },
} satisfies Record<
  PublicLanguage,
  {
    heading: string
    description: string
    navigation: string
    contents: string
    sections: { id: string; heading: string; paragraphs: string[] }[]
  }
>
