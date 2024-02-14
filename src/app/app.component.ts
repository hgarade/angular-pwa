import { OnInit, Component, ApplicationRef } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { concat, first, interval } from 'rxjs';
import { ApiService } from './service/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isOnline = false;
  isNewVersionAvailable: boolean = false;
  isUpdateFound = false;
  userClickedOnNotification = false;
  currentVersionHash: string = '';
  latestVersionHash: string = '';
  versionDetected = '';
  readonly VAPID_PUBLIC_KEY =
    'BNKUkKcQ2gXYbypqLe6ejJvOcnQKfDATy5SBNOoGrV39WgFoHuBni6v11Vzf5NeUNxOsOTMiJeDWXdKJGAsbNEI';

  constructor(
    private updates: SwUpdate,
    private appRef: ApplicationRef,
    private swPush: SwPush,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    window.addEventListener('online', this.updateOnlineStatus.bind(this));
    window.addEventListener('offline', this.updateOnlineStatus.bind(this));
    this.updateOnlineStatus();
    this.logVersionUpdateStatus();
    this.handleUnrecoverableState();

    this.swPush.notificationClicks.subscribe(({ action, notification }) => {
      console.log('action', action);
      console.log('notification', notification);
      if (action === 'explore') {
        this.userClickedOnNotification = true;
        setTimeout(() => {
          this.userClickedOnNotification = false;
        }, 5000);
      }
    });
  }

  updateOnlineStatus() {
    this.isOnline = window.navigator.onLine;
  }

  subscribeToNotifications() {
    this.swPush
      .requestSubscription({
        serverPublicKey: this.VAPID_PUBLIC_KEY,
      })
      .then((sub) => this.apiService.addPushSubscriber(sub).subscribe())
      .catch((err) =>
        console.error('Could not subscribe to notifications', err)
      );
  }

  sendNewsletter() {
    console.log('Sending Newsletter to all Subscribers ...');
    this.apiService.send().subscribe();
  }

  handleUnrecoverableState() {
    this.updates.unrecoverable.subscribe((event) => {
      console.log(
        'An error occurred that we cannot recover from:\n' +
          event.reason +
          '\n\nPlease reload the page.'
      );
    });
  }

  logVersionUpdateStatus() {
    if (this.updates.isEnabled) {
      this.updates.versionUpdates.subscribe((event) => {
        console.log('Event', event);
        switch (event.type) {
          case 'VERSION_DETECTED':
            this.versionDetected = event.version.hash;
            console.log('VERSION_DETECTED', event.version.hash);
            break;
          case 'VERSION_READY':
            this.isNewVersionAvailable = true;
            this.currentVersionHash = event.currentVersion.hash;
            this.latestVersionHash = event.latestVersion.hash;
            console.log('VERSION_READY Current', event.currentVersion.hash);
            console.log('VERSION_READY Latest', event.latestVersion.hash);
            break;
          case 'VERSION_INSTALLATION_FAILED':
            console.log(
              `Failed to install app version '${event.version.hash}': ${event.error}`
            );
            break;
          case 'NO_NEW_VERSION_DETECTED':
            this.isNewVersionAvailable
              ? (this.latestVersionHash = event.version.hash)
              : (this.currentVersionHash = event.version.hash);
            break;
        }
      });
      this.checkForUpdate();
    }
  }

  checkForUpdate() {
    const appIsStable$ = this.appRef.isStable.pipe(
      first((isStable) => isStable === true)
    );
    const everyTenSeconds$ = interval(20000);
    const everyTenSecondsOnceAppIsStable$ = concat(
      appIsStable$,
      everyTenSeconds$
    );

    everyTenSecondsOnceAppIsStable$.subscribe(async () => {
      try {
        this.isUpdateFound = await this.updates.checkForUpdate();
        console.log('isUpdateFound', this.isUpdateFound);
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    });
  }

  updateVersion(): void {
    this.isNewVersionAvailable = false;
    window.location.reload();
  }

  closeVersion(): void {
    this.isNewVersionAvailable = false;
  }
}
