import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class CelcatToJson {
    private String url;
    private ViewType viewType;
    public CelcatToJson(String url, ViewType viewType) {
        this.url = url;
        this.viewType = viewType;
    }

    private String fetchCalendarData(String postData) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(this.url))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(postData))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public String getCalendarData(String start, String end, String resType, String groupIds, String colourScheme) throws Exception {
        String calView;
        switch (this.viewType) {
            case DAY:
                calView = "agendaDay";
                break;
            case WEEK:
                calView = "agendaWeek";
                break;
            case MONTH:
                calView = "month";
                break;
            default:
                calView = "agendaWeek";
        }
        String postData = String.format("start=%s&end=%s&resType=%s&calView=%s&federationIds%%5B%%5D=%s&colourScheme=%s",
                start, end, resType, calView, groupIds, colourScheme);
        return fetchCalendarData(postData);
    }
}
