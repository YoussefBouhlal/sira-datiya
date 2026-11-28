import type { PublicLanguage } from './content.ts'

type HelpCopy = {
  heading: string
  description: string
  navigation: string
  contents: string
  sections: { id: string; heading: string; paragraphs: string[] }[]
}

export const helpCopy: Record<PublicLanguage, HelpCopy> = {
  en: {
    heading: 'Siravuno CV builder help',
    description:
      'Save your CV, download and restore a JSON backup, understand browser storage limits, and check your PDF before sharing it.',
    navigation: 'Help page language',
    contents: 'On this page',
    sections: [
      {
        id: 'saving',
        heading: 'Where your CV is saved',
        paragraphs: [
          'Siravuno keeps one current CV in this browser profile on this site. Edits save automatically after a short delay. There is no account recovery or cloud sync; another browser, device, or site address does not automatically have your draft. Multiple tabs can overwrite one another: the last successful save wins.',
          'Browser storage is not encrypted and is not a permanent backup. Clearing site data or ending a private-browsing session can remove your CV. Download a JSON backup regularly, especially before clearing browser data or moving to another device.',
        ],
      },
      {
        id: 'backup',
        heading: 'Keep an editable JSON backup',
        paragraphs: [
          'In the builder, open the document actions menu and choose Download backup. Keep the downloaded JSON file somewhere you control. It includes your CV content, portrait when present, document language, and appearance settings. Treat it as personal information and share it only intentionally.',
          'To move your CV, open Siravuno in the destination browser and restore that JSON file. A PDF is for sharing the finished CV; it cannot be restored as an editable Siravuno backup.',
        ],
      },
      {
        id: 'restore',
        heading: 'Restore without losing your current work',
        paragraphs: [
          'Download a backup of the current CV first. In the document actions menu, choose Restore backup and select a Siravuno JSON backup. A valid file opens a replacement confirmation. Confirm only when ready to replace the current CV; cancel to keep it unchanged. Restoring also restores the backup’s document language and appearance.',
          'Restore accepts Siravuno JSON backups up to 2 MB. Invalid or unsupported backup files are rejected without replacing the current draft. If saved browser data cannot be read, automatic saving is blocked to avoid overwriting it. Keep the original data or backup and follow the recovery warning; do not clear site data as a first troubleshooting step.',
        ],
      },
      {
        id: 'pdf',
        heading: 'Preview and download your PDF',
        paragraphs: [
          'Enter your name to enable PDF download. Choose a template and A4 or US Letter in the builder, review the generated preview, and download the PDF. Check every page for wrapping, page breaks, contact details, and mixed Arabic/Latin text before sending it.',
          'Your content and settings determine the number of pages. PDF text is selectable, but reading order can vary between readers and recruitment systems, especially with multiple columns. Universal ATS compatibility and tagged-PDF accessibility are not guaranteed.',
        ],
      },
      {
        id: 'language',
        heading: 'Public language and CV language',
        paragraphs: [
          'Reading a public page in English, French, or Arabic does not change your saved CV. Use the builder’s language selector to change document labels and the interface. Your written content is not automatically translated, and there is one current draft, not a separate CV for each language.',
        ],
      },
      {
        id: 'recovery',
        heading: 'Saving problems and starting over',
        paragraphs: [
          'If saving fails, keep the builder open and download a JSON backup before reloading or closing it. The in-memory draft can still contain edits that were not saved. Check the warning and whether this browser permits site storage.',
          'Start over requires confirmation and replaces the current CV. Download a backup first if you need to keep it. Reset keeps the current language preference and does not delete backup files or PDFs already downloaded to your device; manage those files separately.',
        ],
      },
    ],
  },
  fr: {
    heading: 'Aide du créateur de CV Siravuno',
    description:
      'Enregistrez votre CV, téléchargez et restaurez une sauvegarde JSON, comprenez les limites du stockage du navigateur et vérifiez votre PDF.',
    navigation: 'Langue de la page d’aide',
    contents: 'Sur cette page',
    sections: [
      {
        id: 'saving',
        heading: 'Où votre CV est enregistré',
        paragraphs: [
          'Siravuno conserve un seul CV courant dans ce profil de navigateur, sur ce site. Les modifications sont enregistrées automatiquement après un court délai. Il n’y a ni récupération par compte ni synchronisation dans le cloud. Un autre navigateur, appareil ou une autre adresse du site ne retrouve pas automatiquement votre brouillon. Plusieurs onglets peuvent s’écraser mutuellement : le dernier enregistrement réussi prévaut.',
          'Le stockage du navigateur n’est pas chiffré et ne constitue pas une sauvegarde permanente. Effacer les données du site ou terminer une session privée peut supprimer votre CV. Téléchargez régulièrement une sauvegarde JSON, notamment avant d’effacer ces données ou de changer d’appareil.',
        ],
      },
      {
        id: 'backup',
        heading: 'Conserver une sauvegarde JSON modifiable',
        paragraphs: [
          'Dans le créateur, ouvrez le menu des actions du document et choisissez Télécharger la sauvegarde. Conservez le fichier JSON dans un emplacement que vous contrôlez. Il contient le CV, le portrait éventuel, la langue du document et les réglages d’apparence. Traitez-le comme des données personnelles et ne le partagez que volontairement.',
          'Pour transférer votre CV, ouvrez Siravuno dans le navigateur de destination et restaurez ce fichier JSON. Le PDF sert à partager le CV terminé ; il ne peut pas être restauré comme sauvegarde modifiable dans Siravuno.',
        ],
      },
      {
        id: 'restore',
        heading: 'Restaurer sans perdre le travail actuel',
        paragraphs: [
          'Téléchargez d’abord une sauvegarde du CV actuel. Dans le menu des actions du document, choisissez Restaurer une sauvegarde et sélectionnez un fichier JSON Siravuno. Un fichier valide ouvre une demande de confirmation. Confirmez seulement pour remplacer le CV actuel ; annulez pour le conserver. La restauration rétablit aussi la langue et l’apparence de la sauvegarde.',
          'La restauration accepte les sauvegardes JSON Siravuno jusqu’à 2 Mo. Les fichiers invalides ou non pris en charge sont refusés sans remplacer le brouillon. Si les données du navigateur sont illisibles, l’enregistrement automatique est bloqué pour éviter de les écraser. Conservez les données d’origine ou la sauvegarde et suivez l’avertissement de récupération ; n’effacez pas les données du site comme première tentative de dépannage.',
        ],
      },
      {
        id: 'pdf',
        heading: 'Vérifier et télécharger le PDF',
        paragraphs: [
          'Saisissez votre nom pour activer le téléchargement du PDF. Choisissez un modèle et le format A4 ou US Letter dans le créateur, examinez l’aperçu généré puis téléchargez le PDF. Vérifiez chaque page : retours à la ligne, sauts de page, coordonnées et textes mêlant arabe et caractères latins.',
          'Le contenu et les réglages déterminent le nombre de pages. Le texte du PDF est sélectionnable, mais l’ordre de lecture peut varier selon les lecteurs et les systèmes de recrutement, notamment sur plusieurs colonnes. La compatibilité universelle avec les ATS et l’accessibilité d’un PDF balisé ne sont pas garanties.',
        ],
      },
      {
        id: 'language',
        heading: 'Langue publique et langue du CV',
        paragraphs: [
          'Lire une page publique en anglais, français ou arabe ne modifie pas le CV enregistré. Le sélecteur de langue du créateur change les libellés du document et l’interface. Vos textes ne sont pas traduits automatiquement. Il existe un seul brouillon courant, pas un CV distinct par langue.',
        ],
      },
      {
        id: 'recovery',
        heading: 'Échec d’enregistrement et nouveau départ',
        paragraphs: [
          'Si l’enregistrement échoue, gardez le créateur ouvert et téléchargez une sauvegarde JSON avant de recharger ou fermer la page. Le brouillon en mémoire peut contenir des modifications non enregistrées. Consultez l’avertissement et vérifiez que le navigateur autorise le stockage du site.',
          'Recommencer exige une confirmation et remplace le CV actuel. Téléchargez d’abord une sauvegarde pour le conserver. La réinitialisation garde la préférence de langue et ne supprime pas les sauvegardes ni les PDF déjà téléchargés sur votre appareil ; gérez ces fichiers séparément.',
        ],
      },
    ],
  },
  ar: {
    heading: 'مساعدة منشئ السيرة الذاتية Siravuno',
    description:
      'احفظ سيرتك الذاتية ونزّل نسخة JSON احتياطية واستعدها، وتعرّف على حدود تخزين المتصفح وكيفية مراجعة ملف PDF قبل مشاركته.',
    navigation: 'لغة صفحة المساعدة',
    contents: 'في هذه الصفحة',
    sections: [
      {
        id: 'saving',
        heading: 'أين تُحفظ سيرتك الذاتية؟',
        paragraphs: [
          'يحتفظ Siravuno بسيرة ذاتية حالية واحدة في ملف هذا المتصفح على هذا الموقع. تُحفظ التعديلات تلقائيًا بعد مهلة قصيرة. لا توجد استعادة عبر حساب أو مزامنة سحابية؛ لن تظهر مسودتك تلقائيًا في متصفح أو جهاز آخر أو على عنوان مختلف للموقع. قد تستبدل علامات التبويب المتعددة تعديلات بعضها بعضًا؛ يُعتمد آخر حفظ ناجح.',
          'تخزين المتصفح غير مشفّر وليس نسخة احتياطية دائمة. قد يؤدي مسح بيانات الموقع أو إنهاء جلسة تصفح خاص إلى فقدان سيرتك الذاتية. نزّل نسخة JSON احتياطية بانتظام، خصوصًا قبل مسح البيانات أو الانتقال إلى جهاز آخر.',
        ],
      },
      {
        id: 'backup',
        heading: 'الاحتفاظ بنسخة JSON قابلة للتعديل',
        paragraphs: [
          'افتح قائمة إجراءات المستند في المنشئ واختر تنزيل نسخة احتياطية. احتفظ بملف JSON في مكان تتحكم فيه. يتضمن محتوى سيرتك وصورتك إن وُجدت ولغة المستند وإعدادات المظهر. عامله كمعلومات شخصية ولا تشاركه إلا عن قصد.',
          'لنقل سيرتك، افتح Siravuno في المتصفح الآخر واستعد ملف JSON. ملف PDF مخصص لمشاركة السيرة النهائية، ولا يمكن استعادته كنسخة قابلة للتعديل في Siravuno.',
        ],
      },
      {
        id: 'restore',
        heading: 'الاستعادة دون فقدان عملك الحالي',
        paragraphs: [
          'نزّل نسخة احتياطية من سيرتك الحالية أولًا. اختر استعادة نسخة احتياطية من قائمة إجراءات المستند وحدد ملف JSON من Siravuno. إذا كان الملف صالحًا، يظهر طلب تأكيد الاستبدال. أكّد فقط عندما تريد استبدال السيرة الحالية، أو ألغِ للحفاظ عليها. تستعيد العملية أيضًا لغة المستند ومظهره من النسخة الاحتياطية.',
          'تقبل الاستعادة نسخ JSON من Siravuno بحجم لا يتجاوز 2 ميغابايت. تُرفض الملفات غير الصالحة أو غير المدعومة دون استبدال المسودة. إذا تعذرت قراءة البيانات المحفوظة في المتصفح، يتوقف الحفظ التلقائي لتجنب الكتابة فوقها. احتفظ بالبيانات الأصلية أو النسخة الاحتياطية واتبع تنبيه الاستعادة؛ لا تبدأ باستكشاف المشكلة عبر مسح بيانات الموقع.',
        ],
      },
      {
        id: 'pdf',
        heading: 'معاينة ملف PDF وتنزيله',
        paragraphs: [
          'أدخل اسمك لتفعيل تنزيل PDF. اختر قالبًا وحجم A4 أو US Letter في المنشئ، ثم راجع المعاينة ونزّل الملف. تحقق من كل صفحة، بما فيها التفاف السطور وفواصل الصفحات وبيانات الاتصال والنصوص المختلطة بالعربية والحروف اللاتينية، قبل الإرسال.',
          'يحدد محتواك وإعداداتك عدد الصفحات. نص PDF قابل للتحديد، لكن ترتيب القراءة قد يختلف بين قارئات الملفات وأنظمة التوظيف، خصوصًا مع تعدد الأعمدة. لا نضمن توافقًا شاملًا مع أنظمة ATS أو إتاحة ملف PDF موسوم لذوي الإعاقة.',
        ],
      },
      {
        id: 'language',
        heading: 'لغة الصفحات العامة ولغة السيرة الذاتية',
        paragraphs: [
          'لا تغيّر قراءة صفحة عامة بالإنجليزية أو الفرنسية أو العربية سيرتك المحفوظة. استخدم محدد اللغة في المنشئ لتغيير عناوين المستند والواجهة. لا تُترجم نصوصك المكتوبة تلقائيًا، وهناك مسودة حالية واحدة وليست سيرة منفصلة لكل لغة.',
        ],
      },
      {
        id: 'recovery',
        heading: 'مشكلات الحفظ والبدء من جديد',
        paragraphs: [
          'إذا فشل الحفظ، أبقِ المنشئ مفتوحًا ونزّل نسخة JSON احتياطية قبل إعادة تحميله أو إغلاقه. قد تتضمن المسودة في الذاكرة تعديلات لم تُحفظ. راجع التنبيه وتحقق من سماح المتصفح بتخزين بيانات الموقع.',
          'يتطلب البدء من جديد تأكيدًا ويستبدل السيرة الحالية. نزّل نسخة احتياطية أولًا للاحتفاظ بها. تحتفظ إعادة الضبط بتفضيل اللغة ولا تحذف النسخ الاحتياطية أو ملفات PDF التي نُزّلت سابقًا على جهازك؛ أدر هذه الملفات بشكل منفصل.',
        ],
      },
    ],
  },
}
