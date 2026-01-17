public class Cours {
    private String title;
    private String startTime;
    private String endTime;
    private String location;
    private String description;
    private String type;

    /**
     * 
     * @param title         name of the course
     * @param startTime    format "YYYY-MM-DDTHH:MM"
     * @param endTime      format "YYYY-MM-DDTHH:MM"
     * @param location      location of the course
     * @param description         group associated with the course
     * @param type          type of the course{[TD, TP, CM]}
     */
    public Cours(String title, String startTime, String endTime, String location, String description, String type) {
        this.title = title;
        this.startTime = startTime;
        this.endTime = endTime;
        this.location = location;
        this.description = description;
        this.type = type;
    }
    public String getTitle() {
        return title;
    }
    public String getStartTime() {
        return startTime; 
    }
    public String getEndTime() {
        return endTime;
    }
    public int getDurationInMinutes() {
        // Simple parsing assuming format "YYYY-MM-DDTHH:MM"
        String[] startParts = startTime.split("T");
        String[] endParts = endTime.split("T");
        String[] startTimeParts = startParts[1].split(":");
        String[] endTimeParts = endParts[1].split(":");
        
        int startHour = Integer.parseInt(startTimeParts[0]);
        int startMinute = Integer.parseInt(startTimeParts[1]);
        int endHour = Integer.parseInt(endTimeParts[0]);
        int endMinute = Integer.parseInt(endTimeParts[1]);
        
        return (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    }
    public String getLocation() {
        return location;
    }
    public String getDescription() {
        return description;
    }
    public String getType() {
        return type;
    }
    @Override
    public String toString() {
        return "Cours{" +
                "title='" + title + '\'' +
                ", startTime='" + startTime + '\'' +
                ", endTime='" + endTime + '\'' +
                ", location='" + location + '\'' +
                ", type='" + type + '\'' +
                '}';    
    }
}
