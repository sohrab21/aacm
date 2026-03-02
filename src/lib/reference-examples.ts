/**
 * Curated reference examples per content type.
 * These are published, approved pieces used as quality benchmarks in the Bar Raiser system prompt.
 * Only content types with available published examples are included.
 */

export const REFERENCE_EXAMPLES: Record<string, { title: string; text: string }> = {
  "LinkedIn Post": {
    title: "Enablement First, Empowerment Second",
    text: `Stop empowering people who are not enabled.

Most organizations get the sequence wrong.

They hand teams autonomy before giving them the tools to use it.
Then they call the resulting mess a "culture problem."

It is not a culture problem.
It is a design problem.

Autonomy without competence is not empowerment.
It is abandonment.

Leadership removes approvals, steps back, decisions stall, people escalate, and leadership concludes "the people are not ready."

The people were never set up to succeed.
Three conditions fix this. Not in sequence. All three at once.

Context. Competence. Courage.

Context.
Ask your team: what is our priority this quarter, who is our target customer, what trade-offs are we making?

Three different answers from three people means they do not lack autonomy.
They lack direction.

Competence.
Look at the last ten decisions escalated to you.
How many were escalated because the person lacked the knowledge to decide?

That is your competence gap.

Build a weekly decision review around it: one real decision, what was considered, what was traded off.

The leader adds missing context and domain knowledge.

When the team can run that review without you, they stop calling you in.
But they always can.

Courage.
Can your teams list which decisions are theirs without asking?
If that list does not exist, you gave them ambiguity, not permission.

Build a decision map.
Column one: irreversible, high-stakes decisions. These escalate.
Column two: everything else. These belong to the team.

Amazon calls these Type 1 and Type 2.

Explain the decision rights. Confirm the learning was captured. Then do the part most leaders skip: when a Type 2 decision fails, protect the decision. Confirm what was learned. If the first failure leads to blame, no one will decide again.

Context. Competence. Courage. All three are Enablement. None works without the others. Empowerment comes after.

Start with whichever one you failed first.

If none of these structures exist after more than a year of your leadership, that is not an oversight.

It is a design you accepted.

Enablement first. Empowerment second.`,
  },

  Whitepaper: {
    title: "The Speed Trap: Why Cross-Functional Teams Accelerate Before They Stall (Opening Section)",
    text: `The Hidden Cost of Speed

Every organization that has shifted to cross-functional product teams eventually runs into the same problem. The teams are faster. They ship more frequently. The org chart looks modern. But somewhere along the way, things start breaking that nobody notices until the damage is done. And the damage is broader than most leaders realize.

The first thing that breaks is the ownership illusion. Organizations tell teams "you own this end-to-end" and expect ownership to follow from the structural change. But ownership is a capability, not a mandate. It requires knowing how to make decisions when information is incomplete, having the confidence to commit when you're not sure, and the maturity to own consequences rather than deflect them. Most people in most organizations have spent years in systems that trained them to escalate, seek approval, and distribute risk. You can't undo that by redrawing the org chart. Without someone modeling what ownership actually looks like, teams default to a cautious version of it: they "own" the backlog but still escalate anything with real stakes.

The second thing that breaks is learning itself. In a functional organization, knowledge flowed naturally because people with the same skills sat together, reviewed each other's work, shared patterns. Cross-functional teams optimize for delivery flow but sever the learning flow. Team A solves a problem that Team B will face next month, and neither knows. Mistakes get repeated across teams. Solutions don't travel. The organization pays the full cost of discovery independently in every team.

The third thing that breaks is the sense of what "good" looks like. Without a shared definition of quality across teams, each team sets its own bar. And bars drift downward under delivery pressure. Not maliciously, just naturally. "Good enough" became the operating standard, but "good enough" was never defined by anyone who knows what great looks like. It was defined by what the team could get away with while meeting the sprint goal. Technical debt accumulates. Standards that once defined the company erode into whatever each team decides is acceptable.

The fourth thing that breaks is decision quality. Faster decisions are celebrated, but faster decisions made by people who haven't developed their judgment aren't better decisions. They're just faster mistakes. Decision-making under uncertainty is a skill that develops through practice, feedback, and mentoring. In the old model, a senior functional leader was in the room when hard calls were made. In the new model, the team makes the call, often without anyone who has navigated that kind of ambiguity before.

The fifth thing that breaks is the hardest to see: unrealized potential. The organization never knows what it could have achieved. Teams are delivering, customers aren't complaining yet, metrics look acceptable. But the gap between where the team is performing and where it could perform with proper development widens every quarter. It's only when a competitor shows up who invested in their people, or when the organization tries to do something genuinely hard, that the gap becomes visible. And by then it's a chasm.

The root cause is always the same: when organizations reorganize around products, they solve for speed but forget to solve for sustainability. They answer the question "How do we deliver value faster?" without answering the harder follow-up: "How do we keep getting better when the easy gains are exhausted?"

The initial speed gains from cross-functional teams come from removing handoffs, eliminating queues, and giving teams structural autonomy. These are one-time improvements. They work once. After that, the team's speed is bounded by the team's capability. And here's the problem: teams often don't know they've hit the ceiling, because they have no reference point. They've never seen what great looks like in their domain. Nobody is showing them. So they optimize within their current level and call it progress.

This is not a people-development problem dressed up in business language. It is a business performance problem that can only be solved through people development. The distinction matters. A CEO who invests in developing people because "it's the right thing to do" will cut that investment the moment margins tighten. A CEO who understands that capability development is the engine of sustainable business performance will protect it the way they protect R&D budgets: as a non-negotiable competitive investment.`,
  },

  "Newspaper Article": {
    title: "Wer abwartet, verliert die Wahl (Veränderung wählen)",
    text: `Gestern Abend, virtueller Kurs mit Teilnehmern aus der ganzen Welt. Der Trainer, Timothy Clark, Sozialwissenschaftler aus Oxford und Autor von „Epic Change", eröffnete mit einem Satz: „Either you choose change, or change chooses you." Entweder du entscheidest dich für Veränderung - oder die Veränderung entscheidet für dich.

Ich saß an meinem Schreibtisch in Köln und merkte, wie dieser Satz bei mir etwas auslöste. Nicht weil er neu wäre. Sondern weil er so präzise beschreibt, was ich seit Jahren beobachte.

Bei Kunden, deren Vorstände seit drei Jahren über Transformation reden, aber nichts verändern. Bei Wettbewerbern, die ihr Geschäftsmodell von 2015 pflegen, als hätte sich die Welt seitdem nicht gedreht. Bei ganzen Branchen, die zuschauen, wie andere an ihnen vorbeiziehen - und dann überrascht tun, wenn es zu spät ist.

Clark stellte im Kurs eine einfache Frage: Was sind die Vorteile, wenn man Veränderung selbst wählt? Die Antworten lagen auf der Hand: Wer selbst entscheidet, definiert die Richtung. Das Tempo. Die Kontrolle. Wer wartet, bis die Veränderung kommt, verliert all diese Dinge. Man wird getrieben statt zu treiben. Man reagiert statt zu gestalten.

Diese Dynamik sehe ich überall. In Unternehmen, die heute Stellen abbauen, weil sie jahrelang nicht investiert haben. Bei Menschen, die ihren Job verlieren, weil sie aufgehört haben, sich weiterzuentwickeln. In einer Gesellschaft, die lieber verwaltet als gestaltet - und sich dann wundert, dass andere Länder schneller sind.

Warum fällt es manchen Menschen so viel leichter, sich zu verändern? Ich glaube, es hat mit Erfahrung zu tun. Meine Eltern flohen mit uns aus dem Iran. Ich war vier Jahre alt. Neues Land, neue Sprache, neue Regeln - alles gleichzeitig. Veränderung war für mich nie ein Konzept aus einem Managementbuch. Sie war Alltag. Wer früh lernt, dass nichts bleibt, wie es ist, für den wird Anpassung kein Stress, sondern Kompetenz.

Nun muss niemand sein Heimatland verlieren, um diese Kompetenz zu entwickeln. Aber die Bereitschaft, sich auf Neues einzulassen, fällt nicht vom Himmel. Sie entsteht durch Übung. Jede kleine Entscheidung, etwas anders zu machen als gestern, senkt die Schwelle für die nächste. Wer hingegen jede Veränderung aufschiebt, dem wird selbst der kleinste Schritt irgendwann zur Überwindung.

Das Problem ist selten, dass Menschen Veränderung nicht können. Das Problem ist, dass sie zu lange warten. Sie warten auf den perfekten Moment, auf klare Anweisungen, auf Sicherheit. Doch Sicherheit gibt es nicht. Es gibt nur den Unterschied zwischen denen, die handeln, und denen, die reagieren. Zwischen denen, die gestalten, und denen, die andere für sich gestalten lassen.

Clark brachte es im Kurs auf eine zweite Formel: Führung bedeute, den Status quo herauszufordern und den Weg zum nächsten Gleichgewicht zu gestalten. Damit ist - laut Clark - Change Management eine Kernkompetenz. Das gilt nicht nur für Führungskräfte mit Titel. Es gilt für jeden Einzelnen. Für den Mitarbeiter, der spürt, dass seine Fähigkeiten nicht mehr reichen - und trotzdem nichts lernt. Für die Abteilung, die weiß, dass ihr Prozess veraltet ist - und trotzdem weitermacht wie bisher.

Fragen Sie sich heute Abend: In welchem Bereich meines Lebens warte ich gerade ab? Wo halte ich am Status quo fest, obwohl ich weiß, dass er nicht haltbar ist? Und was wäre der kleinste Schritt, den ich morgen gehen könnte?

Sie müssen nicht alles auf einmal verändern. Aber Sie müssen anfangen zu entscheiden. Denn wer abwartet, verliert die Wahl.

Veränderung kommt so oder so. Die einzige Frage ist, ob Sie die Bedingungen festlegen und gestalten, oder andere dies für Sie tun.

Von Nichts kommt Nichts.`,
  },
};
