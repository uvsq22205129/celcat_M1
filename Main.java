import java.util.ArrayList;

public class Main {
    public static void main(String[] args) throws Exception {
        System.out.println("Celcat Calendar Processor");
        Calandar calandar = new Calandar(new ArrayList<>(), "2025-12-08", "2025-12-13", ViewType.WEEK);
        calandar.addGroup(new Group("MIN17217", "M1+info"));
        //calandar.addGroup(new Group("MIN17217", "M1+info+gr.+2"));
        //calandar.addGroup(new Group("MSANGS2I", "M1+info+gr.+3"));
        calandar.getCours().forEach(cours -> {
            System.out.println(cours);
        });
    }
}
