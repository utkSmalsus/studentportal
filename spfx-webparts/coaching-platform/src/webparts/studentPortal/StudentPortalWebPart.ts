import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'StudentPortalWebPartStrings';
import AppRoot from './components/AppRoot';
import { IStudentPortalProps } from './components/IStudentPortalProps';
import { tailwindCss } from './styles/tailwindCss';
import { canvasOverrideCss } from './styles/canvasOverride';
import { getSP } from './services/pnpjsConfig';

export interface IStudentPortalWebPartProps {
  description: string;
}

export default class StudentPortalWebPart extends BaseClientSideWebPart<IStudentPortalWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  // React renders into this div, which lives inside a Shadow Root attached
  // to the webpart's own domElement. SharePoint's page CSS cannot reach
  // inside the shadow tree, and Tailwind's utility classes (injected as a
  // <style> tag scoped to the same shadow tree) cannot leak out onto the
  // rest of the page — this is what keeps the two stylesheets from
  // colliding once this is deployed to a real site.
  private _reactMountPoint: HTMLDivElement | undefined;

  private _injectCanvasOverride(): void {
    const styleId = 'spfx-canvas-override-css';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = canvasOverrideCss;
      document.head.appendChild(style);
    }
    if (this.domElement) {
      this.domElement.style.width = '100%';
      this.domElement.style.maxWidth = '100%';
      this.domElement.style.margin = '0';
      this.domElement.style.padding = '0';
    }
  }

  private _ensureShadowRoot(): HTMLDivElement {
    if (this._reactMountPoint) {
      return this._reactMountPoint;
    }

    const shadowRoot = this.domElement.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = tailwindCss;
    shadowRoot.appendChild(style);

    const mountPoint = document.createElement('div');
    shadowRoot.appendChild(mountPoint);

    this._reactMountPoint = mountPoint;
    return mountPoint;
  }

  public render(): void {
    this._injectCanvasOverride();

    const element: React.ReactElement<IStudentPortalProps> = React.createElement(
      AppRoot,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        userDisplayName: this.context.pageContext.user.displayName,
        userEmail: this.context.pageContext.user.email,
        userLoginName: this.context.pageContext.user.loginName
      }
    );

    ReactDom.render(element, this._ensureShadowRoot());
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    getSP(this.context);
    this._injectCanvasOverride();
    const message = await this._getEnvironmentMessage();
    this._environmentMessage = message;
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    const style = document.getElementById('spfx-canvas-override-css');
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
    }
    if (this._reactMountPoint) {
      ReactDom.unmountComponentAtNode(this._reactMountPoint);
    }
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
