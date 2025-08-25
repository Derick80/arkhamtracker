type CampaignNotesProps = {
  notes: string[];
};

const CampaignNotes = ({ notes }: CampaignNotesProps) => {
  return (
    <div>
      <h2>Campaign Notes</h2>
      <p>Keep track of important notes and events in your campaign here.</p>
      <ul>
        {notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
    </div>
  );
};
export default CampaignNotes;
