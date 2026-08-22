1. provide a one line commit text in english when done with a task.
2. Do not add unnecessary comments inline. Keep inline comments short and in english.
3. Do not use npx/npm commands. Use vp, e.g. vp check, vp test etc.
4. Use english identifiers, function names and variables
5. Every page / module / component has it's own css file (src/css)
6. Files in src/components: PascalCase for a component that renders itself
   (Toast.ts, XkastKongelagRoundRow.ts), camelCase for a shared building block
   that only other components use (numberpadUi.ts, states.ts).
7. A family of related components goes in a subfolder of src/components, with a
   matching subfolder in src/css/components (see components/numberpad).
8. No git add, git commit or git rm unless I ask you to.
