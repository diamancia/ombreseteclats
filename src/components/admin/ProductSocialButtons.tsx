import { Loader2 } from "lucide-react";
import { SocialIcon, SOCIAL_BRAND_COLORS } from "@/components/SocialIcon";
import { SOCIAL_CHANNELS, SOCIAL_CHANNEL_LABELS, parseSocialErrors, type SocialChannel } from "@/lib/socialChannels";

// Trois boutons indépendants (Facebook/Instagram/Pinterest) — chacun ne déclenche que son
// propre canal. Couleur de marque si déjà publié sur ce canal, rouge si en erreur (message au
// survol), gris sinon.
export default function ProductSocialButtons({
  productId,
  socialPostIds,
  socialPostError,
  publishingId,
  onPublish,
}: {
  productId: string;
  socialPostIds?: Partial<Record<SocialChannel, string>>;
  socialPostError?: string | null;
  publishingId: string | null;
  onPublish: (id: string, channel: SocialChannel) => void;
}) {
  const errors = parseSocialErrors(socialPostError);

  return (
    <span className="mr-2 inline-flex items-center gap-1.5 align-middle">
      {SOCIAL_CHANNELS.map((channel) => {
        const key = `${productId}:${channel}`;
        const isPublishing = publishingId === key || publishingId === productId;
        const posted = !!socialPostIds?.[channel];
        const error = errors[channel];
        const color = posted ? SOCIAL_BRAND_COLORS[channel] : error ? "#dc2626" : "#d1d5db";
        const label = `${SOCIAL_CHANNEL_LABELS[channel]}${error ? " — " + error : posted ? " — publié" : " — pas encore publié"}`;
        return (
          <button
            key={channel}
            type="button"
            onClick={() => onPublish(productId, channel)}
            disabled={isPublishing}
            title={label}
            className="disabled:opacity-40"
            style={{ color }}
          >
            {isPublishing ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : (
              <SocialIcon platform={channel} className="h-4 w-4" />
            )}
          </button>
        );
      })}
    </span>
  );
}
