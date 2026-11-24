import { FieldDef, SituationSchema, UrgencyRule } from './types';

// Starter situation schemas. They ask for FACTS only; they state no law and no
// time limits. Every schema carries `reviewed: false` until a qualified lawyer
// (for example the NSUK law clinic) signs off on the questions and rules.
// The engine surfaces that flag so unreviewed content is never presented as final.

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe',
  'Zamfara',
];

// Fields every situation shares. These are what a lawyer needs before anything else.
export const CORE_FIELDS: FieldDef[] = [
  {
    key: 'in_danger',
    label: 'In danger right now',
    question: 'Are you or anyone with you in danger right now?',
    type: 'yesno',
    weight: 5,
    urgency: 1,
    cost: 1,
    required: true,
    pinned: true,
  },
  {
    key: 'state',
    label: 'State',
    question: 'Which state did this happen in?',
    type: 'choice',
    options: NIGERIAN_STATES.map((s) => ({ value: s, label: s })),
    weight: 4,
    urgency: 0,
    cost: 1,
    required: true,
  },
  {
    key: 'when',
    label: 'When it happened',
    question: 'When did this happen? An approximate date is fine.',
    type: 'date',
    weight: 4,
    urgency: 1,
    cost: 1,
    required: true,
  },
  {
    key: 'goal',
    label: 'What the person wants',
    question: 'What outcome do you want?',
    type: 'text',
    weight: 3,
    urgency: 0,
    cost: 2,
    required: true,
  },
];

const withCore = (fields: FieldDef[]): FieldDef[] => [...CORE_FIELDS, ...fields];

const dangerRule: UrgencyRule = {
  id: 'danger',
  level: 'critical',
  reason: 'The person says they or someone with them is in danger now.',
  when: (f) => f.in_danger === 'yes',
};

const policeSchema: SituationSchema = {
  id: 'police',
  title: 'Police or arrest',
  version: 1,
  reviewed: false,
  fields: withCore([
    {
      key: 'police_status',
      label: 'Current status',
      question: 'Where are you or the person involved right now?',
      type: 'choice',
      options: [
        { value: 'detained', label: 'Still held by police' },
        { value: 'released', label: 'Released' },
        { value: 'never_held', label: 'Not held, but threatened or harassed' },
      ],
      weight: 5,
      urgency: 1,
      cost: 1,
      required: true,
    },
    {
      key: 'held_days',
      label: 'Days held',
      question: 'About how many days have they been held?',
      type: 'text',
      weight: 4,
      urgency: 1,
      cost: 1,
      dependsOn: { key: 'police_status', values: ['detained'] },
    },
    {
      key: 'charge_told',
      label: 'Told the reason',
      question: 'Were they told why they were arrested?',
      type: 'yesno',
      weight: 3,
      urgency: 0,
      cost: 1,
    },
    {
      key: 'money_demanded',
      label: 'Money demanded',
      question: 'Did any officer ask for money?',
      type: 'yesno',
      weight: 3,
      urgency: 0,
      cost: 1,
    },
    {
      key: 'what_happened',
      label: 'What happened',
      question: 'In your own words, what happened?',
      type: 'text',
      weight: 4,
      urgency: 0,
      cost: 2,
      required: true,
    },
  ]),
  urgencyRules: [
    dangerRule,
    {
      id: 'still_held',
      level: 'critical',
      reason: 'The person is still being held by police.',
      when: (f) => f.police_status === 'detained',
    },
  ],
  evidence: [
    { key: 'ev_station', label: 'Name of the police station or unit' },
    { key: 'ev_names', label: 'Names or badge numbers of officers, if known' },
    { key: 'ev_docs', label: 'Any paper you were given or made to sign' },
  ],
};

const workSchema: SituationSchema = {
  id: 'work',
  title: 'Work: dismissal, unpaid wages, or treatment at work',
  version: 1,
  reviewed: false,
  fields: withCore([
    {
      key: 'work_issue',
      label: 'Issue',
      question: 'What best describes the problem?',
      type: 'choice',
      options: [
        { value: 'sacked', label: 'I was sacked or told not to come back' },
        { value: 'unpaid', label: 'I am owed salary or other pay' },
        { value: 'harassment', label: 'Harassment or abuse at work' },
        { value: 'other', label: 'Something else' },
      ],
      weight: 5,
      urgency: 0,
      cost: 1,
      required: true,
    },
    {
      key: 'has_contract',
      label: 'Written contract',
      question: 'Do you have a written contract or appointment letter?',
      type: 'yesno',
      weight: 4,
      urgency: 0,
      cost: 1,
    },
    {
      key: 'employer_name',
      label: 'Employer',
      question: 'What is the name of the employer or company?',
      type: 'text',
      weight: 4,
      urgency: 0,
      cost: 2,
      required: true,
    },
    {
      key: 'how_long',
      label: 'Time at the job',
      question: 'How long did you work there?',
      type: 'text',
      weight: 2,
      urgency: 0,
      cost: 1,
    },
    {
      key: 'amount_owed',
      label: 'Amount owed',
      question: 'About how much are you owed, in naira?',
      type: 'text',
      weight: 3,
      urgency: 0,
      cost: 1,
      dependsOn: { key: 'work_issue', values: ['unpaid'] },
    },
    {
      key: 'notice_given',
      label: 'Notice or letter',
      question: 'Were you given any notice or a letter?',
      type: 'yesno',
      weight: 3,
      urgency: 0,
      cost: 1,
      dependsOn: { key: 'work_issue', values: ['sacked'] },
    },
  ]),
  urgencyRules: [dangerRule],
  evidence: [
    { key: 'ev_contract', label: 'Contract or appointment letter' },
    { key: 'ev_payslips', label: 'Payslips or bank alerts for your salary' },
    { key: 'ev_messages', label: 'Messages or emails about the issue' },
  ],
};

const housingSchema: SituationSchema = {
  id: 'housing',
  title: 'Housing: eviction or landlord problems',
  version: 1,
  reviewed: false,
  fields: withCore([
    {
      key: 'housing_issue',
      label: 'Issue',
      question: 'What best describes the problem?',
      type: 'choice',
      options: [
        { value: 'eviction', label: 'I am being asked or forced to leave' },
        { value: 'deposit', label: 'Landlord will not return my money' },
        { value: 'rent_rise', label: 'Rent increase or other charges' },
        { value: 'other', label: 'Something else' },
      ],
      weight: 5,
      urgency: 0,
      cost: 1,
      required: true,
    },
    {
      key: 'notice_received',
      label: 'Notice received',
      question: 'Did you get a written notice?',
      type: 'yesno',
      weight: 4,
      urgency: 1,
      cost: 1,
      dependsOn: { key: 'housing_issue', values: ['eviction'] },
    },
    {
      key: 'locked_out',
      label: 'Locked out or belongings removed',
      question: 'Have you been locked out, or have your things been removed?',
      type: 'yesno',
      weight: 5,
      urgency: 1,
      cost: 1,
      dependsOn: { key: 'housing_issue', values: ['eviction'] },
    },
    {
      key: 'has_agreement',
      label: 'Tenancy agreement',
      question: 'Do you have a written tenancy agreement or rent receipts?',
      type: 'yesno',
      weight: 4,
      urgency: 0,
      cost: 1,
    },
    {
      key: 'landlord_name',
      label: 'Landlord',
      question: 'Who is the landlord or agent?',
      type: 'text',
      weight: 3,
      urgency: 0,
      cost: 2,
    },
  ]),
  urgencyRules: [
    dangerRule,
    {
      id: 'locked_out',
      level: 'high',
      reason: 'The person says they were locked out or their belongings were removed.',
      when: (f) => f.locked_out === 'yes',
    },
  ],
  evidence: [
    { key: 'ev_agreement', label: 'Tenancy agreement or rent receipts' },
    { key: 'ev_notice', label: 'Any notice you were given' },
    { key: 'ev_messages', label: 'Messages with the landlord or agent' },
  ],
};

// Fallback for anything the catalogue does not cover. Uses only the core fields
// plus one free-text field, so an unexpected case is still captured and routed
// to a human instead of being forced into the wrong schema.
const generalSchema: SituationSchema = {
  id: 'general',
  title: 'Something else',
  version: 1,
  reviewed: false,
  fields: withCore([
    {
      key: 'what_happened',
      label: 'What happened',
      question: 'In your own words, what happened?',
      type: 'text',
      weight: 5,
      urgency: 0,
      cost: 2,
      required: true,
    },
    {
      key: 'other_party',
      label: 'Other side',
      question: 'Who is the other person, group, or organisation involved?',
      type: 'text',
      weight: 3,
      urgency: 0,
      cost: 2,
    },
  ]),
  urgencyRules: [dangerRule],
  evidence: [
    { key: 'ev_docs', label: 'Any papers, receipts, or letters about this' },
    { key: 'ev_messages', label: 'Messages or recordings you already have' },
  ],
};

const REGISTRY = new Map<string, SituationSchema>(
  [policeSchema, workSchema, housingSchema, generalSchema].map((s) => [s.id, s]),
);

export function getSchema(id: string): SituationSchema {
  return REGISTRY.get(id) ?? generalSchema;
}

export function listSituations(): Array<{ id: string; title: string }> {
  return [...REGISTRY.values()]
    .filter((s) => s.id !== 'general')
    .map((s) => ({ id: s.id, title: s.title }))
    .concat([{ id: 'general', title: generalSchema.title }]);
}
