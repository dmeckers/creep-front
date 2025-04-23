export const enum RouteNames {
    WELCOME = 'Welcome',
    HOME = 'Home',
    USER_STATION = 'UserStation',
    EDIT_STATION = 'EditStation',
    STATION_PLAYLISTS = 'StationPlaylists',
    EDIT_PLAYLIST = 'EditPlaylist',
    EDIT_PLAYLIST_SONGS = 'EditPlaylistSongs',
    STATION_STREAM = 'StationStream',
    CREATE_OWN_STATION = 'CreateOwnStation',
}

export const ROUTE_NAME_MAP: { [key in RouteNames]: string } = {
    [RouteNames.WELCOME]: "Welcome",
    [RouteNames.HOME]: "Home",
    [RouteNames.USER_STATION]: "User Stations",
    [RouteNames.EDIT_STATION]: "Edit Station",
    [RouteNames.STATION_PLAYLISTS]: "Station Playlists",
    [RouteNames.EDIT_PLAYLIST]: "Edit Playlist",
    [RouteNames.EDIT_PLAYLIST_SONGS]: "Edit Playlist Songs",
    [RouteNames.STATION_STREAM]: "Station Stream",
    [RouteNames.CREATE_OWN_STATION]: "Create Own Station",
}